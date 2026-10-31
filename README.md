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
- Hareket bazında set ve tekrar kaydı, dinlenme zamanlayıcısı
- Gerçek kayıtlara dayalı ağırlık ilerlemesi ve geçmiş
- Plaka ve tahmini 1RM hesaplayıcıları
- Kol çevresi ölçüm kaydı
- Yerel depolama, JSON dışa aktarma ve içe aktarma

## Gizlilik

Veriler varsayılan olarak yalnızca tarayıcının `localStorage` alanında saklanır. Sunucu hesabı veya analitik bulunmaz. Tarayıcı verileri silinirse kayıtlar kaybolabilir; düzenli JSON yedeği al.

## Uyarı

Bu uygulama tıbbi danışmanlık sağlamaz. Antrenman yükünü ve hareketleri kapasitenize göre ayarlayın. Aşırı ağrı durumunda egzersizi bırakın.

## Geliştirme

Ürünün ilk sürümü tek dosyalı HTML/CSS/JS mimarisini korur; refactor ve otomatik testler sonraki iterasyonların hedefidir. `docs/ROADMAP.md` dosyasına bakın.
