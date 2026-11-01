# ARM 5×5 — Workout Tracker

**Canlı uygulama (v0.7.0): https://arm-5x5.vercel.app** · Vercel production READY, manuel dağıtım. GitHub commit'leri otomatik yayınlanmıyor. Ayrıntılar için [Vercel yayın rehberi](docs/VERCEL_DEPLOY.md).

**GitHub sürümü: v0.7.0** · Canlı Vercel sürümü: **v0.7.0**. 12 haftalık kol odaklı, yerel çalışan antrenman takipçisi.

Orijinal Strength 5×5 programı korunur. İsteğe bağlı **ARM Growth** şablonu 6–15 tekrar aralıkları ve çift ilerleme (double progression) uygular. Uygulama internetsiz çalışabilecek bir PWA olarak yapılandırılmıştır. Dağıtım manuel olarak yapılmıştır; sonraki güncellemeler otomatik yayınlanmaz.

## Hızlı başlangıç

Gereksinimler: **Node.js 20.19+**, npm.

```bash
npm install
npm run dev
```

Terminalde gösterilen yerel adresi aç. Kaynak `index.html` dosyasını doğrudan `file://` ile açmak artık desteklenen çalışma yöntemi değildir; stiller Vite ile derlenir.

```bash
npm test
npm run build
npm run preview
```

Statik yayına hazırlanmış dosyalar `dist/` klasöründedir. **Bu depoda otomatik canlı dağıtım bulunmaz.** Manuel doğrulama için GitHub **Actions → Verify ARM 5x5 → Run workflow** kullanılabilir. Bu işlem yalnızca test eder, build çıktısını artifact olarak saklar; siteyi yayına almaz.

## Antrenman deneyimi

- 12 hafta; A/B/A → B/A/B döngüsü ve 7. hafta toparlanma.
- Seans panosu, hedef tekrar aralıkları, sıradaki hareket ve set ilerlemesi.
- **Tek dokunuşla** önerilen seti kaydet; gerekirse tekrar ve ağırlığı düzenle.
- **Hızlı giriş satırı:** gerçek kg / tekrar değerini doğrudan yazıp kaydet.
- Önceki antrenman ağırlığını ve tekrarını görüntüle.
- Dinlenme sayacı ve ±15 saniye kısayolu.
- Kaydetmeden önce eksik set kontrolü ve gelecek yük önerisi.
- **Son seansı geri al:** son kayda ait gerçek setleri, ağırlık artışını ve ilerleme konumunu geri yükler; eski sürümden kalan loglarda gerekli geri alma verisi yoksa bu buton çalışmaz.
- **Growth programı:** bağımsız çalışma ağırlıkları, 6–15 tekrar aralıkları, kullanıcı tarafından bildirilen enerji/eklem durumuna göre yük artışı önerisi.
- **Gelişim:** haftalık doğrudan biceps/triceps setleri, 12 haftalık SVG grafik, kas yükü gösterimi, gerçek kayıtlardan tahmini 1RM.
- Kol ölçümü: soğuk ve pump ölçümleri ayrı kaydedilir; büyüme farkına yalnızca soğuk ölçüler girer.

**Antrenman notu:** 5×5 veya Growth için varsayılan ağırlıklar kişisel reçete değildir; kendi kondisyonuna ve ekipmana göre düzenle. Dirsek/bilek ağrısını zorlayarak sürdürme. Hacim grafiği yalnızca burada kaydedilmiş doğrudan setleri sayar; başka antrenmanların dolaylı yükünü bilmez.

## Veri güvenliği ve yedek

Kayıtlar varsayılan olarak cihazın `localStorage` alanındadır; hesap, reklam, analitik veya otomatik bulut senkronizasyonu bulunmaz.

**Araçlar → Veri Yedekleme & Sıfırlama:**
1. **JSON Yedeğini İndir:** sürümlenmiş bir `.json` dosyası indirir.
2. **JSON'dan Geri Yükle:** dosya (≤2 MB) doğrulanır; kullanıcı onayından **sonra** yerel kayıtların yerini alır. Geçersiz dosya mevcut kayıtları değiştirmez.
3. **Fabrika Ayarları:** tüm yerel kayıtları siler; önce yedek indir.

Yedek içe aktarma eski v0.3 durum nesnelerini de kabul eder. JSON dosyaları güvenilmeyen girdi olarak değerlendirilir; seanslar, setler, ağırlıklar ve ölçümler doğrulanır. Kötü amaçlı HTML gösterimine karşı tarih ve açıklama alanları escape edilir. **Cihazı sıfırlamadan önce yedek al.**

## Offline kullanım

- Vite + Tailwind CSS v3 yerel derlemesi; çalışma anında Tailwind CDN'ine bağımlı değildir.
- `vite-plugin-pwa` (MIT) ile Workbox tabanlı cache ve manifest.
- Özelleştirilmiş ARM 5×5 SVG ikon; fontlarda sistem fallback.
- İlk kurulum ve güncelleme için internet bağlantısı gerekir; kurulmuş build sonrası temel antrenman ekranı offline çalışacak şekilde yapılandırılmıştır.
- Service worker yalnızca uygun HTTPS (ve localhost) ortamında etkinleşir. iOS Safari/Android gerçek cihaz kabul testleri ve **bağımsız production build doğrulaması halen yapılmalıdır**.

## Tasarım ve lisans politikası

ARM uygulama ikonu ve SVG kas yükü gösterimi bu projeye özgü olarak yazıldı. **Setlog, Ischys, openGym veya MuscleMap'in kaynak kodu/görselleri doğrudan kopyalanmadı.** Davranış ve etkileşim yaklaşımları referans alındı. Kullanılan açık kaynak paketler ve lisansları `docs/OPEN_SOURCE.md` dosyasında kaydedilmiştir. Açık kaynak depoların public olması, içeriklerinin serbestçe kopyalanabileceği anlamına gelmez.

Uygulama deposuna henüz bir genel açık kaynak **LICENSE** dosyası eklenmedi; kodun tamamına MIT gibi bir lisans verme kararı ayrıca alınmalıdır.

## Kalite durumu

- Regresyon testleri `tests/app.test.cjs` dosyasında, Node'un test çalıştırıcısını kullanır.
- 61 senaryo kod simülasyonunda geçti. Uygulama HTML denge ve JavaScript syntax kontrolleri yapıldı.
- Manuel GitHub Actions workflow eklendi; workflow çalıştırıldığı doğrulanmadı.
- Gerçek cihaz, VoiceOver, uzun süreli offline ve soğuk başlatma testleri henüz tamamlanmadı.

Ayrıntılar için `docs/ROADMAP.md`, `docs/DESIGN.md` ve `docs/OPEN_SOURCE.md` dosyalarına bak.

## v0.6 — Performance Logger (GitHub, henüz canlıda değil)

- Beş büyük set kartı yerine beş kompakt SET / ÖNCEKİ / KG / TEKRAR / ONAY satırı.
- Satırdaki KG ve tekrar düzenlenebilir; + tuşu boş seti kaydeder. Tamamlanmış ✓ tuşuna dokunarak detay düzenleme ve silme açılır.
- Önceki sütun aynı program şablonunda gerçekten kaydedilmiş setlerden hesaplanır; hayali geçmiş gösterilmez.
- Aktif egzersiz açık, diğerleri kapalı; teknik ve plaka ayarları ikincil.
- Dinlenme sayacı artık üst üste binen sabit bant değil, Antrenman içindeki açılır panel.
- Alt sekme çubuğu safe-area kullanır, sayısal giriş odaklandığında gizlenir.
- Program: 12 hafta yol haritası. İlerleme: gerçek seans, toplam hacim ve soğuk kol ölçümü özetleri.
- Türkçe ondalık virgül formatlı ağırlık girişi desteklenir.
- 45 JavaScript regresyon senaryosu geçti. Gerçek iPhone/Android ve üretim build doğrulaması devam ediyor.
- Önceki yerel kayıt şeması ve ağırlık artırma algoritması değiştirilmedi.
- **v0.5.0 ve v0.6.1 sürümleri artık eski üretim sürümleridir.** Yeni sürüm ancak ayrıca yayınlanırsa canlıya çıkar.

## v0.6.1 — PWA önbellek düzeltmesi

- Eski `prompt` konfigürasyonu, kullanıcıya güncelleme onayı sunulmadan service worker'ı bekletebiliyordu.
- `vite-plugin-pwa` `autoUpdate`, `skipWaiting` ve `clientsClaim` kullanıyor.
- `vercel.json` HTML, SW ve kayıt dosyalarında uygun HTTP önbellek kontrolü uyguluyor.
- Antrenman panosunda **Yeni arayüz · v0.6.1** etiketi, kullanıcının doğru sürümü gördüğünü anlamasını sağlar.
- Uygulamaya yeni SW kontrolü geçerse kullanıcı kontrollü Yenile butonu gösterilir.
- Yeni üretim deployment: `dpl_EKMiL4n2Q9qJTBR2x3k8hN8oDyHc` (**READY**). Otomatik Git deploy hâlâ kapalı.
- Eski SW'ı tutan iPhone için farklı deployment alan adı ayrı bir tarayıcı origin'i olduğundan anında karşılaştırma yapmakta işe yarar, fakat **orijinal domain'deki localStorage kayıtları bu test alan adına otomatik taşınmaz**.

## v0.7.0 — Beş ekranlı yeni arayüz (Vercel'de yayında)

Önceki her şeyin aynı sayfada olduğu yoğun deneyim yerine kullanıcı tarafından seçilen görsel tasarım esas alınarak yeni ekran mimarisi uygulandı:

1. **Bugün:** Sıradaki Workout A/B, Başlat/Devam Et, hafta/seans/soğuk kol gelişimi, yalnızca üç hareket ve son gerçek seans.
2. **Aktif Antrenman:** Sekmeler gizlenir; tek egzersiz, kg/tekrar, doğrudan sayı düzenleme, Seti Tamamla, set göstergesi, timer, hareket ileri/geri ve seans özeti. Growth toparlanma girişi katlanabilir.
3. **Program:** Gerçek A/B/A haftalık sırası, 12 hafta, 7. hafta hafifletme, mevcut şablonların hareketleri ve şablon seçimi.
4. **İlerleme:** Gerçek seanslar, hacim, soğuk ölçümler, performans grafiği, kişisel rekorlar ve boş veri durumları.
5. **Ayarlar:** Dinlenme, ses, kg, ayrı plaka/kol ölçümü/1RM/ağırlık araçları, JSON yedekleri.

`src/v7.css` yeniden tasarımın bağımsız responsive stilini içerir. Veri motoru ve mevcut `localStorage` anahtarı korunmuştur. **61/61 kod düzeyi regresyon simülasyonu geçti**, fakat gerçek iPhone Safari QA, gerçek `npm run build` ve görsel karşılaştırma tamamlanmadı.

Ayrıntılar: [v0.7 UI ve kabul kriterleri](docs/V07_UX.md). Vercel'e manuel olarak v0.7.0 üretim dağıtımı yapılmıştır; yeni GitHub kodları otomatik yayınlanmaz.

### v0.7.0 üretim dağıtımı

- **URL:** https://arm-5x5.vercel.app
- **Deployment ID:** `dpl_DBPXGjteu7ZyqcmAnupThZGWEgC2`
- **Durum:** READY, production alias bağlandı.
- Vite build logunda `dist/index.html`, `assets/index-6ouLSsWs.css`, `sw.js` ve `manifest.webmanifest` üretimi doğrulandı.
- 61 kod simülasyonu geçti; gerçek iPhone Safari, VoiceOver ve PWA offline acceptance testleri henüz tamamlanmadı.
- Git bağlantısı olmadığı için yeni commitler otomatik dağıtılmıyor.
