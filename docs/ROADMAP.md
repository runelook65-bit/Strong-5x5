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

## 0.2 — Antrenman deneyimi (sırada)

- Tek set için gerçek tekrar sayısı girişi (çoklu dokunuş döngüsü yerine)
- Dinlenme sayacını seçilebilir sürelerle özelleştirme
- Antrenman öncesi ısınma ve hareket formu ipuçları
- Dambıl ağırlığı tek el / çift el / toplam yük tanımlarını netleştirme
- Daha okunaklı haftalık takvim ve birincil seans ekranı
- Erişilebilir metin ölçekleri, hareket azaltma ve VoiceOver etiketleri

## 0.3 — Veri güvenliği ve analiz

- JSON dosya olarak dışa/içe aktarma + doğrulama
- Eski veri şemaları için sürümlü migration
- Soğuk kol ölçülerini pump ölçümlerinden ayrı izleme
- Haftalık biceps/triceps set hacmi ve dinlenme günleri analizi
- Antrenman kayıtlarını düzenleme / geri alma ve geçmişten devam

## 0.4 — Ürünleştirme

- CDN'deki Tailwind'i kaldırıp derlenmiş CSS'e geçiş
- Statik PWA, çevrimdışı çalışma, iPhone ana ekranına ekleme
- CI, tarayıcı tabanlı e2e testleri, statik hosting
- İsteğe bağlı Supabase hesabı ve cihazlar arası senkronizasyon
- Kullanıcı onayı olmadan ücretli geçiş veya abonelik eklememe

## Program geliştirme notu

Kol hipertrofisi için bütün hareketlere zorunlu 5×5 uygulatmak doğru varsayım değildir. Ana hareketlerde güç takibi yapılırken izolasyonlarda daha yüksek tekrar aralıkları ve kontrollü form korunmalı; dirsek/bilek yükü ve toparlanma gözlenmelidir. İlk aşamada mevcut üç şablon aynen tutulur.

## Ürün sınırları

Bu repository mevcut tek dosyalı prototipin başlangıcıdır. Otomatik deployment veya çoklu cihaz senkronizasyonu henüz etkin değildir. Yerel tarayıcı verileri kullanıcı tarafından yedeklenmelidir.
