# ARM 5×5 — v0.7 Home-first Workout Design

## Tasarım hedefi

Eski sürümde Antrenman sekmesi **ana ekran + aktif set tablosu + timer + program ayarı + toparlanma + seans kaydetme** öğelerini tek yerde gösteriyordu. v0.7 bu sorunu CSS yamasıyla gizlemek yerine ekranları işlevlerine göre ayırır.

Referans: daha önce konuşmada seçilen beş ekran mockup'ı. Tasarım dili: near-black OLED, emerald CTA, ince kenarlıklı kartlar, tipografi hiyerarşisi ve gerçek antrenman verisi. Mockup'taki *örnek* hareketler ve istatistikler programa körü körüne uygulanmadı.

## Adım 1 — Bugün / Home

- **Hedef:** Açıldıktan sonra beş saniyede sıradaki antrenmanı anlamak.
- Kişisel marka/başlık, sıradaki Workout A/B, hareket ve set sayısı, **Başlat / Devam Et** CTA.
- Hafta ilerlemesi, mevcut haftada kaydedilmiş seans sayısı, yalnızca gerçek **soğuk kol ölçümleri** arasındaki fark.
- Mevcut program şablonundan üç hareket listesi. Her hareket başlatılarak doğrudan odak ekranına gidilebilir.
- Son gerçek seans özeti. Boş durumda veri uydurulmaz.
- **Yok:** set tablosu, timer kontrolleri, plaka hesaplayıcı, büyük teknik paneller.

## Adım 2 — Aktif Antrenman / Focus

- **Hedef:** Bir seferde yalnızca bir egzersiz, bir sonraki set, tek birincil aksiyon.
- Bottom nav gizli; geri butonuyla Bugün'e dönülür. Başlanmış setler saklanır.
- Gerçek hareketin adı, görseli, tekrar aralığı ve sıra numarası.
- Büyük **toplam kg** ve **tekrar** göstergesi; +/- veya sayı üzerine dokunup klavyeyle düzenleme.
- **Seti Tamamla** mevcut `recordExerciseSet` fonksiyonunu kullanır; değerler ve timer mevcut kayıt motoruna gider.
- Set daireleri gerçek veriyi gösterir; tamamlanmış sete dokunarak düzenleme/silme açılır.
- Setler bitince sıradaki harekete otomatik ilerler; ayrıca geri/ileri ve yatay kaydırma desteği.
- Timer yalnızca otomatik başlatılmış veya tamamlanmış dinlenme süresi için görünür; -15/+15/duraklat/atla.
- Growth toparlanma bildirim alanı katlanabilir; yük artışı davranışı eski motorla aynıdır.
- Tam seans sonunda mevcut **seans önizleme ve onay modali** korunur. Eksik set varsa işlem engellenir.
- Seans sıfırlama kullanıcı onayına bağlıdır.

## Adım 3 — Program

- Gerçek `completedSlots` kayıtlarından 36 seanslık ilerleme.
- Gerçek A/B/A ve B/A/B haftalık sırası; seçilebilir Pazartesi/Çarşamba/Cuma.
- Mevcut `TEMPLATES` içinden **gerçek** hareket listeleri; mockup'ta farklı hareketler yazsa da program motoru değiştirilmedi.
- 12 haftalık grid; 7. hafta toparlanma vurgusu.
- Program seçimi (standard, Growth, hibrit, StrongLifts arm); başlanan seans varsa geçmeden önce onay.
- Seçilen hafta ve gün yerel veride tutulur, setler `w<week>_d<day>_<template>` izolasyonunu korur.

## Adım 4 — İlerleme

- Yalnızca gerçek `workoutLogs` ile seans sayısı ve toplam ağırlık×tekrar hacmi.
- Soğuk kol ölçüm farkı; Pump ölçümleri bu değişim hesabına girmez.
- Seçilen hareketin `exStats.history` grafiği.
- Hafta bazında gerçek toplam hacim grafiği; kayıt yoksa açıklamalı boş durum.
- Gerçek ağırlıklı tamamlanmış setlerden kişisel rekorlar.
- Soğuk ve Pump son ölçüm kartları.
- Kol ölçümüne veya detaylı antrenman geçmişine özel araç ekranından erişim.

## Adım 5 — Ayarlar ve araçlar

- Antrenman tercihleri: hareketin varsayılan dinlenmesini kullan / 90–180 sn; ses durumu; kg.
- Ayrı araç sayfaları: plaka hesaplayıcı, soğuk/Pump kol ölçümü, çalışma ağırlıkları, 1RM ve geçmiş.
- Dosyaya JSON yedek / JSON içe aktar / veri sıfırlama eski doğrulanmış mekanizmalar üzerinden çalışır.
- Mevcut DOM/form düğümleri yeni araç sayfasına **taşınır**; geri dönüldüğünde orijinal DOM ebeveynine iade edilir. Bu, bağlı listener ve input durumlarını korur.
- Yedek doğrulamasında `v7RestSeconds` opsiyoneldir; eski yedekleri kabul etmeye devam eder.

## Veri ve dağıtım garantileri

- `STORAGE_KEY`, `workoutLogs`, `activeSets`, `activeWeights`, `completedSlots` ve exStats profillerinin eski yapısı değiştirilmedi.
- Çalışma ağırlığı/tekrar önerisi ve 7. hafta davranışı eski hesaplama fonksiyonlarını kullanır.
- İlk açılış **Bugün**; aktif seans setleri yerel veride saklanır.
- v0.7.0, Vercel'e manuel olarak yayınlanmıştır (**READY**, `dpl_DBPXGjteu7ZyqcmAnupThZGWEgC2`). Otomatik GitHub dağıtımı kapalıdır. Gerçek cihaz doğrulamaları sürmektedir.
- Otomatik GitHub push → Vercel production deployment yoktur.

## Test durumu ve açık kabul kriterleri

Kod düzeyi JavaScript test simülasyonu: **61/61 geçti**, HTML yapı dengesi ayrı doğrulanır. Bu, gerçek tarayıcı veya telefon testi yerine geçmez.

- [ ] Safari iPhone 320/375/390/430pt: CTA/sekme/safe-area ve gerçek ekran kırpılmaları.
- [ ] Safari: kg/tekrar klavye modali, ekran büyütme, VoiceOver.
- [ ] Başlat → set tamamla → 90/150sn timer → hareket ilerlet → kaydet → Bugün'de sonraki program.
- [ ] Growth 6–15 tekrar, enerji/eklem durumu, ağırlık önerisi.
- [ ] Program haftası/day/şablon değişince daha önce girilen setlerin kaybolmaması.
- [ ] JSON içe alma ve eski v0.6.1 localStorage üstüne yükseltme.
- [ ] Ayarlar → Kol Ölçümü, Ağırlıklar, 1RM → Ayarlar geçişinde form listener ve değerlerin korunması.
- [ ] iPhone PWA offline başlatma, App Switcher'dan geri dönme, timer cihaz kilidinde davranışı.
- [ ] Bağımsız `npm install && npm test && npm run build` çalıştırılması.
- [ ] Tasarım karşılaştırmasında mockup'ın tipografi, boşluk, kontrast ve set odak davranışlarının görsel doğrulanması.

Kodun doğrudan kaydedilmesi tasarımın gerçek cihazda onaylandığı anlamına gelmez. Özellikle hareket görselleri mevcut yerleşik proje görselleridir; mockup'taki anatomi görsellerinin aynısı değildir.

## v0.7.1 tasarım uyarlaması

Referans görsellerin beş ekranlı bilgi mimarisi korunurken profesyonel glassmorphism katmanı seçici biçimde eklendi. Floating dock, glass hero, mat veriler, SVG ikonlar ve large kg/reps alanları için stil kaynağı `src/v7-glass.css` dosyasıdır. Gerçek antrenman durumunu gösteren etiket ve tamamlanmış seans butonu mantığı güncellendi.

Bu sürümün görsel eşdeğerliği cihaz üzerinde karşılaştırılmadı. GitHub **v0.7.1**, Vercel canlı **v0.7.0** olarak ayrıdır.
