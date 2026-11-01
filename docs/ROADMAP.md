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

## Yayın kriterleri

Yayına çıkmadan önce:
1. Gerçek `npm run build` ve regresyonlar geçmeli.
2. Eski kullanıcının kayıtları korunmalı; JSON yedek içe/ihracı tarayıcıda test edilmeli.
3. Ana ekran, set tamamlama, timer, geri alma ve offline kurulum telefon üzerinde kabul testini geçmeli.
4. Otomatik ücretli geçiş, reklam veya izleme eklenmemeli.
5. **Her commit otomatik canlı yayınlanmamalı**; dağıtım ayrı kullanıcı kararı olarak yönetilmeli.
