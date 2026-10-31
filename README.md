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
- Gerçek kayıtlara dayalı ağırlık ilerlemesi ve geçmiş
- Plaka ve tahmini 1RM hesaplayıcıları
- Kol çevresi ölçüm kaydı
- Yerel depolama ve panoya JSON yedekleme

## Gizlilik

Veriler varsayılan olarak yalnızca tarayıcının `localStorage` alanında saklanır. Sunucu hesabı veya analitik bulunmaz. Tarayıcı verileri silinirse kayıtlar kaybolabilir; düzenli JSON yedeği al. JSON dosyası içe aktarma henüz eklenmedi.

## Uyarı

Bu uygulama tıbbi danışmanlık sağlamaz. Antrenman yükünü ve hareketleri kapasitenize göre ayarlayın. Aşırı ağrı durumunda egzersizi bırakın.

## Kontrol

Node.js 20+ ile `npm test` komutu 11 regresyon testini çalıştırır. Gerçek iPhone/Android tarayıcı kabul testi henüz yapılmadı. Bu aşamada canlı dağıtım etkin değil.

## Geliştirme

Ürünün ilk sürümü tek dosyalı HTML/CSS/JS mimarisini korur; refactor ve otomatik testler sonraki iterasyonların hedefidir. `docs/ROADMAP.md` dosyasına bakın.
