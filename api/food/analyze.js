import {securityConfigured,verifyGoogleIdToken,consumeDailyQuota,AnalysisSecurityError} from './security.js';
// Vercel serverless function: estimates calories and macros from a meal photo.
// Requires the OPENROUTER_API_KEY secret on Vercel.
// Free vision model only: never silently fall back to a paid provider.
// Optional: OPENROUTER_MODEL (must end in :free), ALLOWED_ORIGINS.

const MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';
const MAX_IMAGE_CHARS = 3_000_000; // ~2.2 MB of JPEG after base64
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const TOOL = {
  name: 'report_meal',
  description: 'Fotoğraftaki yemeğin besin değerlerini raporla.',
  input_schema: {
    type: 'object',
    properties: {
      is_food: { type: 'boolean', description: 'Fotoğrafta yenebilir bir yiyecek veya içecek var mı?' },
      name: { type: 'string', description: 'Öğünün kısa Türkçe adı, ör. "Tavuk döner dürüm"' },
      items: {
        type: 'array',
        description: 'Tabaktaki ayrı bileşenler',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Türkçe bileşen adı' },
            grams: { type: 'number', description: 'Tahmini porsiyon, gram' },
            kcal: { type: 'number' },
            protein: { type: 'number', description: 'gram' },
            carbs: { type: 'number', description: 'gram' },
            fat: { type: 'number', description: 'gram' }
          },
          required: ['name', 'grams', 'kcal', 'protein', 'carbs', 'fat']
        }
      },
      confidence: { type: 'string', enum: ['yüksek', 'orta', 'düşük'] },
      note: { type: 'string', description: 'Kullanıcıya tek cümlelik Türkçe not (varsayımlar, gizli yağ/sos uyarısı vb.)' }
    },
    required: ['is_food', 'name', 'items', 'confidence']
  }
};

const SYSTEM = `Sen deneyimli bir diyetisyensin. Kullanıcı bir yemek fotoğrafı gönderir; görünen her bileşenin porsiyonunu tabak, çatal, el gibi ölçek ipuçlarıyla gram olarak tahmin et ve kalori ile makroları standart besin veritabanı değerlerine göre hesapla.
- Türk mutfağını iyi tanı (pilav, mercimek çorbası, döner, lahmacun, menemen, börek, ayran vb.).
- Pişirme yağını, sosları ve içecekleri hesaba kat; emin değilsen gerçekçi ortalama değer kullan ve note alanında belirt.
- Kullanıcı bir düzeltme notu verdiyse onu kesin bilgi kabul et.
- Fotoğrafta yiyecek yoksa is_food=false ve boş items döndür.
- Sayıları tam sayıya yuvarla. Yalnızca geçerli bir JSON nesnesi üret; Markdown, açıklama veya kod bloğu üretme.`;

function originAllowed(req) {
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  if (typeof origin !== 'string' || typeof host !== 'string') return false;
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || parsed.username || parsed.password ||
        parsed.pathname !== '/' || parsed.search || parsed.hash) return false;
    // Production requests are HTTPS only. Local HTTP is permitted only when
    // the request host itself is localhost; arbitrary localhost origins must
    // never be whitelisted for a production hostname.
    if (parsed.protocol === 'https:' && parsed.host === host) return true;
    if (process.env.NODE_ENV !== 'production' &&
        parsed.protocol === 'http:' && /^localhost(?::\d+)?$/.test(host) &&
        parsed.host === host) return true;
    const explicit = (process.env.ALLOWED_ORIGINS || '')
      .split(',').map(value => value.trim()).filter(Boolean);
    return parsed.protocol === 'https:' && explicit.includes(origin);
  } catch {
    return false;
  }
}

const num = v => Math.max(0, Math.round(Number(v) || 0));

function clean(input) {
  const items = (Array.isArray(input.items) ? input.items : []).slice(0, 20).map(i => ({
    name: String(i.name || 'Bileşen').slice(0, 60),
    grams: num(i.grams), kcal: num(i.kcal), protein: num(i.protein), carbs: num(i.carbs), fat: num(i.fat)
  }));
  return {
    is_food: !!input.is_food && items.length > 0,
    name: String(input.name || 'Öğün').slice(0, 80),
    items,
    confidence: ['yüksek', 'orta', 'düşük'].includes(input.confidence) ? input.confidence : 'orta',
    note: input.note ? String(input.note).slice(0, 240) : ''
  };
}

export function createFoodAnalyzeHandler({
  authenticate=verifyGoogleIdToken,
  charge=consumeDailyQuota
}={}) {
return async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!originAllowed(req)) return res.status(403).json({ error: 'origin' });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || !securityConfigured() ||
      (!MODEL.endsWith(':free') && MODEL !== 'openrouter/free')) {
    return res.status(503).json({ error: 'not_configured' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const image = body && typeof body.image === 'string' ? body.image.replace(/^data:[^,]+,/, '') : '';
  const type = body && TYPES.has(body.mediaType) ? body.mediaType : 'image/jpeg';
  const hint = body && typeof body.hint === 'string' ? body.hint.trim().slice(0, 300) : '';
  if (!image || image.length > MAX_IMAGE_CHARS || !/^[A-Za-z0-9+/=]+$/.test(image)) {
    return res.status(400).json({ error: 'image' });
  }

  // Reject unauthenticated traffic before consuming third-party AI quota.
  const authorization=String(req.headers?.authorization||'');
  const bearer=/^Bearer ([A-Za-z0-9._-]{40,8192})$/.exec(authorization);
  if(!bearer)return res.status(401).json({error:'auth'});
  let account,quota;
  try{
    account=await authenticate(bearer[1],process.env.GOOGLE_CLIENT_ID);
    quota=await charge(account.sub);
  }catch(error){
    if(error instanceof AnalysisSecurityError)
      return res.status(error.status).json({error:error.code});
    return res.status(503).json({error:'auth_service'});
  }
  if(!quota?.allowed)return res.status(429).json({error:'quota'});
  res.setHeader('X-StrongFits-Quota-Remaining',String(quota.remaining));

  const content = [
    { type: 'text', text: hint ? `Kullanıcı düzeltmesi: ${hint}. Bu öğünü analiz et.` : 'Bu öğünü analiz et.' },
    { type: 'image_url', image_url: { url: `data:${type};base64,${image}` } }
  ];

  let r;
  try {
    r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM + '\nJSON schema: ' + JSON.stringify(TOOL.input_schema) },
          { role: 'user', content }
        ]
      })
    });
  } catch (_error) {
    return res.status(502).json({ error: 'upstream' });
  }
  if (!r.ok) {
    const status = r.status === 429 ? 429 : 502;
    return res.status(status).json({ error: status === 429 ? 'busy' : 'upstream' });
  }
  const data = await r.json().catch(() => null);
  const message = data?.choices?.[0]?.message;
  // OpenRouter usually returns JSON text. Support function-call output as well.
  const toolArgs = message?.tool_calls?.find(c => c.function?.name === 'report_meal')?.function?.arguments;
  const raw = toolArgs || (typeof message?.content === 'string'
    ? message.content
    : Array.isArray(message?.content) ? message.content.find(c => c.type === 'text')?.text : '');
  if (typeof raw !== 'string' || raw.length > 12000) return res.status(502).json({ error: 'parse' });
  let parsed;
  try { parsed = JSON.parse(raw.replace(/^\x60\x60\x60(?:json)?\s*|\s*\x60\x60\x60$/g, '').trim()); }
  catch (_error) { return res.status(502).json({ error: 'parse' }); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return res.status(502).json({ error: 'parse' });
  }
  return res.status(200).json(clean(parsed));
}

}

export default createFoodAnalyzeHandler();
export {clean, originAllowed};
