// Vercel serverless function: estimates calories and macros from a meal photo.
// Requires the ANTHROPIC_API_KEY environment variable on the Vercel project.
// Optional: ANTHROPIC_MODEL (default below), ALLOWED_ORIGINS (comma-separated).

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
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
- Sayıları tam sayıya yuvarla. Yalnızca report_meal aracını kullan.`;

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin requests from some browsers omit it
  const list = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (list.includes(origin)) return true;
  try {
    const host = new URL(origin).host;
    return host === req.headers.host || /^localhost(:\d+)?$/.test(host);
  } catch (e) {
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

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!originAllowed(req)) return res.status(403).json({ error: 'origin' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'not_configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const image = body && typeof body.image === 'string' ? body.image.replace(/^data:[^,]+,/, '') : '';
  const type = body && TYPES.has(body.mediaType) ? body.mediaType : 'image/jpeg';
  const hint = body && typeof body.hint === 'string' ? body.hint.trim().slice(0, 300) : '';
  if (!image || image.length > MAX_IMAGE_CHARS || !/^[A-Za-z0-9+/=]+$/.test(image)) {
    return res.status(400).json({ error: 'image' });
  }

  const content = [
    { type: 'image', source: { type: 'base64', media_type: type, data: image } },
    { type: 'text', text: hint ? `Kullanıcının düzeltmesi: ${hint}` : 'Bu öğünü analiz et.' }
  ];

  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'report_meal' },
        messages: [{ role: 'user', content }]
      })
    });
  } catch (e) {
    return res.status(502).json({ error: 'upstream' });
  }
  if (!r.ok) {
    const status = r.status === 429 ? 429 : 502;
    return res.status(status).json({ error: status === 429 ? 'busy' : 'upstream' });
  }
  const data = await r.json();
  const use = (data.content || []).find(c => c.type === 'tool_use' && c.name === 'report_meal');
  if (!use) return res.status(502).json({ error: 'parse' });
  return res.status(200).json(clean(use.input || {}));
}

module.exports = handler;
module.exports.clean = clean;
module.exports.originAllowed = originAllowed;
