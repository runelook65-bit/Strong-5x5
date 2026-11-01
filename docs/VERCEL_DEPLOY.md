# ARM 5×5 — Vercel Üretim Dağıtımı

## Yayın durumu

- **Üretim URL:** https://arm-5x5.vercel.app
- **Durum:** READY (Vercel API tarafından doğrulandı)
- **Proje:** arm-5x5
- **Team:** ciceromaniaq (Rune)
- **Deploy:** dpl_DMJe35gYGLZDLkp9GkLDP9aQEbWf
- **Kaynak sürüm:** ARM 5×5 v0.5.0, GitHub main'deki 6abcbf914dfdc1d21673edaf736cba5c33ac3def commit kaynaklarına karşılık gelen 7 kaynak dosyası
- **Framework:** Vite
- **Komut:** npm install && npm run build
- **Dağıtım tipi:** Vercel API üzerinden manuel dosya yükleme
- **Git CI bağlantısı:** Bağlı değil; yeni commit'ler kendiliğinden dağıtılmıyor
- **Erişim kontrolü:** Proje düzeyinde SSO ve parola koruması kapalı

## Dağıtım doğrulaması

Vercel build loglarında `vite v6.4.5` ile başarılı derleme, CSS bundle, PWA manifest dosyası ve Workbox service worker üretimi görüldü. Üretim deployment'ı `READY` ve `arm-5x5.vercel.app` alias'ı atanmış. Tarayıcı üzerinde kapsamlı etkileşim/cihaz testi henüz yapılmadı.

İlk GitHub kaynaklı dağıtım `git_info_fail` ile başarısız oldu; derleme başarısızlığı değildi. Git bağlantısına bağımlı olmamak için aynı repodaki kaynak dosyaları doğrudan Vercel API ile gönderildi. Bu yöntem, push başına otomatik deployment yapmaz.

## Önceki Netlify girişimi

https://app.netlify.com/projects/arm-5x5 üzerinde boş Netlify sitesi oluşturulmuştu, ilk deploy yapılmadı. **Canlı sürüm Vercel'dedir.** Netlify sitesi otomatik silinmedi, diğer projelere dokunulmadı.

## Güncelleme disiplini

1. GitHub'daki son kaynakta `npm test` ve `npm run build` çalıştır.
2. Sürümü Vercel'deki **arm-5x5** projesine manuel gönder.
3. `READY` durumu ve production domain alias'ını doğrula.
4. Ana ekran, set kaydetme, JSON import/export ve PWA güncelleme testleri yap.
5. Kullanıcı açıkça istemedikçe GitHub push → otomatik prod deployment açma.

## Önemli

Eski bir Netlify/localhost alan adında kayıt varsa, `localStorage` domain bazlı olduğu için kayıtlar Vercel'e kendiliğinden geçmez. Eski uygulamanın JSON dışa aktarımıyla yedeğini alıp Vercel uygulamasında içe aktar.
