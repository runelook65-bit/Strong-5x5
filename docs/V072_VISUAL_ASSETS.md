# ARM 5×5 — v0.7.2 Visual Covers

## Uygulanan özgün sanat varlıkları

Üretilmiş sekiz görsel, üçüncü taraf geçici bağlantılara bağlı kalmadan GitHub içinde iki optimize edilmiş WebP atlasına işlendi.

| Atlas | Fiziksel dosya | Boyut | İçerik |
|---|---|---:|---|
| Beş kapak | `public/visual-assets/arm-covers-atlas.webp` | 21,670 byte | Home, Focus / Barbell Curl, Program, Progress, Settings |
| Üç egzersiz | `public/visual-assets/arm-exercises-atlas.webp` | 6,344 byte | Barbell Curl, Hammer Curl, Skull Crusher |

Sıralama ve CSS eşlemeleri `src/v7-glass.css` içindedir. Mobil performansı korumak amacıyla görsel varlıklar 480×270 / 160×160 karelere indirilip tek sprite'larda birleştirildi. Özgün PNG üretim dosyaları daha yüksek çözünürlüktedir; uygulamaya konulan WebP varlıklar **hafif gösterim sürümleridir**, orijinaller değil.

## Ekran eşlemeleri

- **Bugün:** `.arm-cover-home` → atlasın 1. kapağı; metin ve birincil CTA okunması için sol koyu gradient.
- **Aktif Antrenman:** `.arm-cover-focus` → atlasın 2. kapağı, yalnızca `barbell_curl` egzersizinde. Diğer hareketlerde eski ilgili egzersiz görseli korunur.
- **Program:** `.arm-cover-program` → atlasın 3. kapağı.
- **İlerleme:** `.arm-cover-progress` → atlasın 4. kapağı; metinler gerçek kullanıcı verisinden bağımsız editorial başlıktır.
- **Ayarlar:** `.arm-cover-settings` → atlasın 5. kapağı.
- **Hareket kartları:** `barbell_curl / hammer_curl / skull_crusher` için 3 karelik atlas; diğer egzersizlerde mevcut görsellere geri dönülür.

Arka plan kapakları dekoratiftir, ekran okuyucuda önemli başlık veya kontrolleri gizlemez. Görsel dosyalar GitHub'da yerel olduğundan, PWA'nın mevcut `**/*.webp` önbellek kuralıyla çevrimdışı kullanım için de derleme kapsamına alınır.

## Kısıtlar ve doğrulama

- [x] Dosyalar GitHub'a **ikili blob olarak** işlendi; Git SHA değerleri kaynak WebP dosyalarından hesaplanan SHA'larla eşleşiyor.
- [x] Home/Focus/Program/Progress/Settings arka planları ve ilgili üç egzersiz kartı bağlandı.
- [x] 69 JavaScript regresyon test simülasyonu geçti.
- [x] HTML etiket yapısı ve ID benzersizliği doğrulandı.
- [ ] Gerçek iPhone Safari'de küçük ekran, safe-area, metin üstü gradient ve görsel kırpma görsel QA.
- [ ] Bağımsız `npm test && npm run build`, derlenmiş `dist/visual-assets` dosyaları ve offline PWA testleri.
- [ ] Kullanıcı açıkça istediğinde Vercel'de manuel yayına alma; GitHub commit'leri otomatik deploy yapmaz.

**Sürüm ayrımı:** GitHub kaynak kodu **v0.7.2**, son kullanıcı tarafından açıkça yayınlatılan Vercel canlı sürümü **v0.7.0**.
