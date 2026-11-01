# ARM 5×5 — Ürün Geliştirme Yol Haritası

## 0.1 — Temel takip ve kritik hata düzeltmeleri (tamamlandı)

- Mevcut tek dosyalı HTML uygulamasını GitHub'a aktarma
- Seansların hafta, gün, şablon, A/B ve hareket bazında ayrılması
- Boş setlerden sahte tamamlanma veya otomatik ağırlık artırma hatasını engelleme
- Aynı seansın iki kez kaydedilmesini engelleme
- Yeni kullanıcılar için sahte set/kol çevresi/performans verilerini kaldırma
- Mobil arka planda geçen süreyi hesaba katan dinlenme sayacı
- Tam veri sıfırlama ve geçmiş silme için onay
- Node'un dahili test sistemiyle temel regresyon testleri

## 0.2 — Antrenman deneyimi (kod tamamlandı; gerçek cihaz QA bekliyor)

- [x] Tek dokunuşla set tamamla, tamamlanan sete tekrar dokunarak gerçek tekrar (0–30) ve ağırlık düzenle
- [x] Set başına gerçek yük + tekrar bazlı hacim ve programdan bağımsız seans kayıtları
- [x] Kaydetmeden önce set, hacim, eksik setler ve sonraki ağırlık hedefi önizlemesi
- [x] Toparlanma haftasında (7. hafta) çalışma ağırlığını otomatik artırmama
- [x] İkincil program seçeneklerini kapatılabilir bölüme al; ilerleme ve sıradaki hareketi öne çıkar
- [x] İki süre kısayolu + 15 sn ekleme, arka planda gerçek zamanlı dinlenme sayacı (mevcut)
- [x] Hareket tekniği ve hafif ısınma notları, dambılda toplam kg açıklaması
- [x] Temel aria-label, modal rolü, görünür klavye odağı ve reduced-motion (kaynak seviyesinde)
- [ ] iOS Safari, Android Chrome ve VoiceOver ile gerçek cihaz kabul testi
- [ ] Tüm setlere ayrı ağırlık girişi yapan akışın gerçek cihaz ergonomi testi
- [ ] Harici cihazda uzun metin/büyük yazı/hizalama testi

## 0.3 — Program & Growth Engine (kod tamamlandı; gerçek cihaz QA bekliyor)

- [x] Mevcut üç şablonu koruyarak ARM Growth şablonu ekleme
- [x] Ana hareketlerde 6–10, izolasyonlarda 8–15 tekrar aralıkları
- [x] Çift ilerleme: üst tekrar sınırına ulaşmadan ağırlık artmıyor
- [x] Düşük gerçek set ağırlığında yük artışı önerilmiyor
- [x] Kuvvet ve Growth ağırlık profillerini bağımsız tutma
- [x] Seans bazlı öz-bildirim: enerji durumu ve eklem rahatsızlığı
- [x] Toparlanma olumsuz veya bilinmiyorsa Growth yük artışını durdurma
- [x] Tamamlanan setlerin alt tekrar hedefini sağlamasına göre haftalık doğrudan biceps/triceps hacmi
- [x] Eksik eski kayıtları hacim için sıfır varsaymama, açıklama gösterme
- [x] Tahmini 1RM ve grafiklerde sahte başlangıç noktası göstermeme
- [ ] Gerçek iPhone Safari/Android testleri ve VoiceOver kabul testi
- [ ] Farklı cihazlarda eski v0.2 verisinin kayıpsız içeri alınması
- [ ] Gerçek ekipmanla artış adımlarının kişiye göre ayarlanması

## 0.4 — Veri güvenliği ve analiz

- JSON dosya olarak dışa/içe aktarma + doğrulama
- Eski veri şemaları için sürümlü migration
- Soğuk kol ölçülerini pump ölçümlerinden ayrı izleme
- Dinlenme günleri ve aynı kasın ardışık yüklenmesi analizi
- Antrenman kayıtlarını düzenleme / geri alma ve geçmişten devam

## 0.5 — Ürünleştirme

- CDN'deki Tailwind'i kaldırıp derlenmiş CSS'e geçiş
- Statik PWA, çevrimdışı çalışma, iPhone ana ekranına ekleme
- CI, tarayıcı tabanlı e2e testleri, statik hosting
- İsteğe bağlı Supabase hesabı ve cihazlar arası senkronizasyon
- Kullanıcı onayı olmadan ücretli geçiş veya abonelik eklememe

## Program geliştirme notu

Kol hipertrofisi için bütün hareketlere zorunlu 5×5 uygulatmak doğru varsayım değildir. Ana hareketlerde güç takibi yapılırken izolasyonlarda daha yüksek tekrar aralıkları ve kontrollü form korunmalı; dirsek/bilek yükü ve toparlanma gözlenmelidir. Mevcut üç şablon korunur. Dördüncü ARM Growth şablonu kullanıcı tarafından manuel seçilir. Growth ağırlıkları ayrı profilde tutulur; başlangıç yükleri yalnızca örnek olup kişiye göre ayarlanmalıdır. Enerji ve rahatsızlık bilgisi öz-bildirimdir, sağlık tanısı değildir. Program dışındaki antrenmanların dolaylı set yükü hacim ekranına dahil edilmez.

## Ürün sınırları

Bu repository mevcut tek dosyalı prototipin başlangıcıdır. Otomatik deployment veya çoklu cihaz senkronizasyonu henüz etkin değildir. Yerel tarayıcı verileri kullanıcı tarafından yedeklenmelidir.
