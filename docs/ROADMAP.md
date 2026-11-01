# ARM 5×5 — Ürün Yol Haritası

## v0.1–v0.3 · Tamamlandı (kod düzeyinde)

- v0.1: 12 haftalık A/B takvim, egzersiz setleri, yerel seans kayıtları, ilk regresyonlar.
- v0.2: Seans odaklı mobil arayüz, gerçek kg/tekrar verisi, seans özeti, güvenli ağırlık ilerlemesi.
- v0.3: İsteğe bağlı ARM Growth (hipertrofi), 6–15 tekrar aralıkları, seans bazlı toparlanma bildirimi, bağımsız kuvvet/Growth yük profili, gerçek kol hacmi.

## v0.4 · Veri güvenliği ve analiz (kod tamamlandı)

- [x] Dosyaya sürümlenmiş JSON yedek indirme.
- [x] JSON veri, oturum, set, ağırlık, ölçüm ve nested obje doğrulaması.
- [x] Güvensiz, şişirilmiş veya hatalı veriyi yedek içe almadan reddetme.
- [x] Mevcut kayıtları değiştirmeden **önce** doğrulama, kullanıcıdan onay alma.
- [x] `localStorage` yazma hatasında bellek durumunu koruma.
- [x] Eski v0.3 yerel yedek formatını kabul etme.
- [x] Son kaydedilmiş seansı, gerçek setler ve ağırlık geçmişiyle güvenli geri alma.
- [x] Soğuk kol ölçümlerini pump ölçümlerinden bağımsız değerlendirme.
- [x] Tek ölçüm silme.
- [x] Etkileşimli 12 haftalık biceps/triceps SVG çalışma hacmi grafiği.
- [x] Özgün kas yükü gösterimi.
- [x] Eski metinlerde HTML escape ile güvenli görüntüleme.
- [ ] Büyük ve gerçek cihaz kayıtlarıyla geri yükleme kabul testi.
- [ ] Cihazlar arası yedek taşıma (iOS Safari ↔ Android) kabul testi.
- [ ] Çok daha eski v0.1 önizleme verilerinin gerçek örnekleriyle migration doğrulaması.

## v0.5 · Tasarım ve çevrimdışı PWA (altyapı kaynak kodu tamamlandı)

- [x] Setlog benzeri tek satırda hızlı gerçek kg / tekrar girişi.
- [x] Özgün uygulama kimliği ve vektör ikon.
- [x] Vite + Tailwind CSS v3 + PostCSS + Autoprefixer build kurulumu.
- [x] Tailwind runtime CDN kaldırıldı.
- [x] MIT lisanslı `vite-plugin-pwa` ile offline precache / manifest konfigürasyonu.
- [x] Otomatik deploy içermeyen **manuel** GitHub Actions verify workflow.
- [x] Açık kaynak lisans / özgün varlık ayrımı `docs/OPEN_SOURCE.md` içinde.
- [x] UI sistemi ve ekran ilkeleri `docs/DESIGN.md` içinde.
- [ ] **`npm install && npm test && npm run build` bağımsız gerçek Node ortamında çalıştırılmalı.**
- [ ] iPhone Safari Home Screen kurulumu, ikon görünümü ve offline tekrar açma.
- [ ] Android Chrome PWA kurulumu, kesilen internet ve güncelleme davranışı.
- [ ] Safari/VoiceOver/TalkBack, ekran büyütme, dinlenme sayacı QA.
- [ ] Seans sırasında sayfa yenileme/cihaz uyutma/güncelleme kabul testleri.
- [ ] CSS paket boyutu / Lighthouse performans denetimi.

## v0.6 · Ürün sağlamlaştırma (ileri aşama)

- [ ] Her şablon için program sıralaması ve yük profili üzerinde gerçek antrenman denemeleri.
- [ ] Kullanıcının önceki egzersiz setinden yüklere otomatik ön doldurma seçenekleri.
- [ ] Antrenman geçmişi için filtreleme ve güvenli düzenleme (son seans dışı değişikliklerin geçmiş ilerlemeyi bozması engellenmeli).
- [ ] Antrenman aralıkları gerçek takvim tarihine göre hesaplanmalı, haftalık A/B sırası kaçırılan günlerden etkilenmemeli.
- [ ] `localStorage` → IndexedDB geçişi ve doğrulanmış migration.
- [ ] Otomatik ve isteğe bağlı bulut eşitlemesi, ancak kullanıcı ihtiyacı doğrulanınca.
- [ ] Egzersiz görselleri için kaynak/izin envanteri; hakları belirsiz üçüncü taraf animasyonları kullanmama.
- [ ] Açık kaynak lisansı kararı: repo public olsa da şu anda kodu otomatik olarak açık kaynak lisanslı değildir.

## v0.6 — Performance Logger (GitHub'da kod tamamlandı; gerçek telefon QA bekliyor)

- [x] iPhone'da kesilen sticky dinlenme şeridi yerine Workout içinde katlanabilir timer.
- [x] Header dar alanda küçüldü; safe-area ve sabit alt navigasyon boşlukları düzenlendi.
- [x] Klavye açılıp set inputuna odaklanıldığında alt navigasyon gizlenir.
- [x] Tek set giriş yöntemi: SET / ÖNCEKİ / KG / TEKRAR / ONAY.
- [x] Önceki sütun yalnızca aynı şablonun gerçek kaydedilmiş setinden doldurulur.
- [x] Dolu set düzenlenebilir; detay editörü set silme için korunur.
- [x] Aktif egzersiz önde, geri kalan egzersizler katlanabilir.
- [x] Program 36 seans ilerleme göstergesi; açıklamalar katlanabilir.
- [x] İlerleme ekranında seans, gerçek hacim ve soğuk kol ölçümü.
- [x] Türkçe ondalık virgül ve aria-current ile erişilebilirlik iyileştirmeleri.
- [x] 45 kod düzeyi regresyon testi.
- [ ] iPhone Safari (320–430px, büyütülmüş yazı, klavye, alt sekme) kabul testi.
- [ ] Android/TalkBack, iOS VoiceOver, PWA ve timer gerçek cihaz testleri.
- [ ] Bağımsız Node npm test + Vite production build kontrolü.
- [ ] Vercel dağıtımı; kullanıcı istemediği sürece yapılmaz.

## v0.7 — Home-first Workout Redesign (kaynak kod tamamlandı)

- [x] **Adım 1: Bugün** — ayrı, sade açılış ekranı ve gerçek Workout A/B özeti.
- [x] **Adım 2: Aktif Antrenman** — tam odak modu, kg/tekrar düzenleme, timer, set ilerleme, geri/ileri ve seans onayı.
- [x] **Adım 3: Program** — A/B hafta düzeni, 12 haftalık yol haritası, mevcut şablonlar ve deload.
- [x] **Adım 4: İlerleme** — gerçek kayıtlardan KPI, çizgi/çubuk grafikleri, PR ve ölçümler.
- [x] **Adım 5: Ayarlar** — araçlar bağımsız alt ekranlarda, veriler ve ayarlar ayrı bölümlerde.
- [x] Mevcut antrenman motoru, JSON yedeği ve kayıt anahtarı korundu.
- [x] 61/61 JavaScript test simülasyonu geçti.
- [ ] Bağımsız Node `npm test && npm run build` ve Vite CSS üretimi doğrulaması.
- [ ] iPhone Safari/Android Chrome UI davranışları, modal klavye, safe-area, küçük ekran ve VoiceOver.
- [ ] v0.6.1'den veri taşıma/geriye uyum ve offline PWA cold-start testi.
- [ ] Mockuplarla gerçek görsel karşılaştırma; özellikle fotoğrafik hero varlıkları mevcutta CSS/yerleşik hareket görselleriyle temsil ediliyor.
- [ ] **Vercel production yayını kullanıcı açıkça isteyince.**

Ayrıntılar için [v0.7 tasarım spesifikasyonu](V07_UX.md).

## v0.7.1 — Precision Glass tasarım uyumu (kod tamamlandı)

- [x] Referans beş mockup ile hiyerarşi uyumunu güçlendirme.
- [x] Üst bölümde seçici translucent hero; alt navigasyonda floating frosted glass.
- [x] KG/tekrar ve grafikleri yüksek kontrastlı okunabilir mat yüzeylerde tutma.
- [x] Alt tab ve Ayarlar'da tutarlı SVG ikonlar, blur desteklenmeyen tarayıcı fallback'i.
- [x] Ready / In progress / Completed durumunu gerçek seans verisinden oluşturma.
- [x] iPhone safe-area, en az 44px dokunma alanı, reduce-motion/reduce-transparency.
- [x] 66/66 JavaScript simülasyonu, HTML ve CSS statik denetimi.
- [ ] Gerçek iPhone Safari ekran görüntüsü ve önceki mockup'larla birebir hizalama değerlendirmesi.
- [ ] `npm install && npm test && npm run build` ve Android/VoiceOver performans testi.
- [ ] Kullanıcı isterse manuel Vercel yayını; mevcut canlı v0.7.0 sürümüne dokunulmaz.

## v0.7.2 — Visual Covers (kod ve varlıklar tamamlandı)

- [x] Üretilmiş 5 ekran kapağı optimize edilip `public/visual-assets/arm-covers-atlas.webp` dosyasına eklendi.
- [x] Üretilmiş 3 egzersiz görseli `public/visual-assets/arm-exercises-atlas.webp` dosyasına eklendi.
- [x] Home, Focus, Program, Progress ve Settings kapakları doğru atlas dilimlerine bağlandı.
- [x] Barbell Curl, Hammer Curl, Skull Crusher küçük görselleri bağlandı; diğer hareketlerde eski görseller korunuyor.
- [x] Safe-area, metin kontrastı ve kart hiyerarşisi korunarak sprite stil sistemi tamamlandı.
- [x] 69/69 JS regresyon simülasyonu ve HTML yapı kontrolü geçti; kaynak dosyalar Git blob olarak doğrulandı.
- [ ] Gerçek iPhone Safari küçük ekran, yoğun yazı ve görsel kırpma QA.
- [ ] `npm test && npm run build`, PWA offline ve iOS erişilebilirlik testleri.
- [ ] Kullanıcı ayrıca isterse manuel Vercel üretim dağıtımı.

Ayrıntılı görsel harita: [Visual Covers](V072_VISUAL_ASSETS.md).

## v0.8 — Minimal UI (kaynak kod tamamlandı)

- [x] shadcn/ui tasarım ilkeleriyle mevcut vanilla Vite uygulamasına uyumlu token ve bileşen katmanı.
- [x] Büyük fotoğraf kapakları görev alanlarından kaldırıldı; daha kısa ve dengeli kartlar.
- [x] Sabit alt navigasyon inceltildi; iOS safe-area ve ekran altı boşluk güncellendi.
- [x] Hareket listesi için tutarlı küçük SVG işaretleri, gerçek performans verileri korunuyor.
- [x] Program, ilerleme ve ayarlar aynı mat tasarım sistemiyle düzenlendi.
- [x] 79 JavaScript regresyon ve UI kontrat testi simülasyonda başarılı.
- [ ] Bağımsız Node ortamında `npm install && npm test && npm run build`.
- [ ] iPhone Safari 375–430 px gerçek görsel QA, klavye, PWA ve VoiceOver kontrolü.
- [ ] Gerçek React/shadcn bileşen kurulumuna ancak mevcut antrenman/veri motoru modüler ayrıştırıldıktan sonra karar verilmesi.
- [ ] Kullanıcı ayrıca isterse Vercel manuel üretim dağıtımı.

Ayrıntılar: [v0.8 Minimal UI](UI_V08.md).

## Yayın kriterleri

Yayına çıkmadan önce:
1. Gerçek `npm run build` ve regresyonlar geçmeli.
2. Eski kullanıcının kayıtları korunmalı; JSON yedek içe/ihracı tarayıcıda test edilmeli.
3. Ana ekran, set tamamlama, timer, geri alma ve offline kurulum telefon üzerinde kabul testini geçmeli.
4. Otomatik ücretli geçiş, reklam veya izleme eklenmemeli.
5. **Her commit otomatik canlı yayınlanmamalı**; dağıtım ayrı kullanıcı kararı olarak yönetilmeli.
