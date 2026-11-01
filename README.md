# ARM 5×5

**12 haftalık kol odaklı antrenman takipçisi.**

Telefon öncelikli, tarayıcıda çalışan ücretsiz bir antrenman uygulaması. Bar, dambıl ve sehpa ile yapılabilecek kol antrenmanları için A/B planı, set/tekrar kaydı, dinlenme sayacı, antrenman geçmişi ve ölçü takibi içerir.

## Çalıştırma

`index.html` dosyasını tarayıcıda aç veya statik site sunucusu kullan:

```bash
python3 -m http.server 8000
```

Ardından `http://localhost:8000` adresini ziyaret et.

## Özellikler

- 12 haftalık A/B/A – B/A/B programı; 7. hafta hacim azaltımı
- Odaklanmış seans ekranı: set ilerlemesi, sıradaki hareket, ısınma ve teknik notları
- Tek dokunuşla set tamamlama; kaydı tekrar açıp gerçek tekrar ve ağırlığı düzenleme
- Hareket ve set bazında gerçek ağırlık/hacim hesabı, dinlenme zamanlayıcısı
- Kaydetmeden önce eksik set kontrolü, bir sonraki çalışma ağırlığı önizlemesi
- 7. haftada hafifletilmiş set sayısı ve yük artışının durdurulması
- **ARM Growth (isteğe bağlı):** 6–15 tekrar aralıkları, çift ilerleme ve ayrı başlangıç ağırlıkları
- Öz-bildirime dayalı toparlanma takibi; düşük enerji veya eklem rahatsızlığında ağırlık artışını durdurma
- Program haftası bazında kaydedilmiş doğrudan biceps/triceps setleri ve gerçek hacim
- Gerçek set kaydı olmadan tahmini 1RM veya grafik verisi üretmeme
- Gerçek kayıtlara dayalı ağırlık ilerlemesi ve geçmiş
- Plaka ve tahmini 1RM hesaplayıcıları
- Kol çevresi ölçüm kaydı
- Yerel depolama ve panoya JSON yedekleme

## Gizlilik

Veriler varsayılan olarak yalnızca tarayıcının `localStorage` alanında saklanır. Sunucu hesabı veya analitik bulunmaz. Tarayıcı verileri silinirse kayıtlar kaybolabilir; düzenli JSON yedeği al. JSON dosyası içe aktarma henüz eklenmedi.

## Growth şablonunu kullanma

1. **Antrenman** ekranında **Program / gün / şablon seçimi** bölümünü aç.
2. Şablon olarak **ARM Growth · Hipertrofi** seç.
3. Growth ağırlıkları, 5×5 hedeflerinden bağımsız ve daha düşük **örnek** başlangıç değerleridir. Gerçek kapasiten ve ekipmanına göre ayarla.
4. Seans öncesi enerji durumunu seç; dirsek/bilek rahatsızlığın varsa belirt.
5. Her sette gerçek tekrar ve toplam ağırlığı gir. Örn. 3×6–10 için tüm setler 10 tekrara ulaşmadan ağırlık artmaz.
6. **İlerleme** ekranında program haftasının doğrudan set hacmini gör. Eski özet kayıtlarının set kırılımı yoksa sayılmaz.

**Veri notu:** Mevcut `localStorage` anahtarı korunur. Henüz gerçek cihazda v0.2→v0.3 geçiş testi ve JSON içe aktarma doğrulaması yapılmadı.

## Uyarı

Bu uygulama tıbbi danışmanlık sağlamaz. Antrenman yükünü ve hareketleri kapasitenize göre ayarlayın. Aşırı ağrı durumunda egzersizi bırakın.

## Kontrol

Node.js 20+ ile `npm test` komutu regresyon testlerini çalıştırır. Kod düzeyindeki 21 senaryonun JavaScript test simülasyonunda geçtiği kontrol edilmiştir; GitHub Actions / gerçek tarayıcı CI henüz kurulmadı. Gerçek iPhone/Android tarayıcı kabul testi henüz yapılmadı. Bu aşamada canlı dağıtım etkin değil.

## Geliştirme

Ürünün ilk sürümü tek dosyalı HTML/CSS/JS mimarisini korur; refactor ve otomatik testler sonraki iterasyonların hedefidir. `docs/ROADMAP.md` dosyasına bakın.
