# ARM 5×5 — Açık kaynak entegrasyon kaydı

## Doğrudan bağımlılıklar

| Paket | Lisans | Kullanım |
|---|---|---|
| [Vite](https://github.com/vitejs/vite) | MIT | Development server / production build |
| [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) | MIT | Service worker, manifest, offline asset caching |
| [Tailwind CSS v3](https://github.com/tailwindlabs/tailwindcss) | MIT | Yerel, dağıtıma derlenen CSS |
| [PostCSS](https://github.com/postcss/postcss) | MIT | CSS işleme |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | MIT | Tarayıcı uyumluluğu |

Bu paketlere `package.json` üzerinden başvurulur; dağıtım derlemesi otomatik yayın değildir. NPM paketlerinin kendi lisans metinleri yayın sırasında ayrıca denetlenmelidir.

## İncelenen, ancak kodu kopyalanmayan referanslar

| Proje | Ne öğrendik | Neden doğrudan kopyalanmadı? |
|---|---|---|
| [Ischys](https://github.com/ischys-app/Ischys) | Mobile-first workout akışı, offline veri modeli | ARM mevcut Vanilla JS mimarisini koruyor |
| [Setlog](https://github.com/nikovassi/setlog) | Hızlı set girişi, önceki set, undo | Kod lisansı doğrudan doğrulanamadı; yalnızca UX referansı |
| [MuscleMap](https://github.com/Jsplice/MuscleMap) | Yüksek kontrastlı ısı haritası | React + ayrı varlık sistemi; ARM için özgün minimal SVG çizildi |
| [openGym](https://github.com/DuarteSantos8/openGym) | RPE/çift ilerleme/analiz | AGPL-3.0 uyumluluğu nedeniyle kaynak kod taşınmadı |
| [free-exercise-db](https://github.com/yuhonas/free-exercise-db) | Egzersiz açıklamaları ve taksonomi | Görsel lisansı ayrıca doğrulanmadan içerik ithal edilmedi |
| [Recharts](https://github.com/recharts/recharts) | İlerleme grafikleri | React bağımlılığı; şimdilik framework bağımsız, orijinal SVG grafik |

ARM 5×5'in yeni PWA ikonu, kas görseli ve 12 haftalık grafik kodu bu repo için üretildi. Bu kaynaklardan alınmış kod, video, görsel, SVG path veya font kopyası değildir.

## Lisans uygulama ilkeleri

1. Kaynak kodun yanında aynı varlıkların da kullanım haklarını doğrula.
2. MIT/ISC bileşenlerinin atıf ve lisans metinlerini gereken yerde koru.
3. AGPL/GPL bileşenleri dahil edilmeden önce dağıtımın copyleft yükümlülüklerini incele.
4. Tasarım örneğinin görünür olması kod ve görseli kopyalama izni anlamına gelmez.
5. Bu depo henüz kendi uygulama kodu için açık kaynak lisans seçmiş değildir.
