# ARM 5×5 — Netlify üretim yayını

Bu belge **henüz gerçekleşmiş bir deploy iddiası değildir**. Netlify projesi oluşturuldu; GitHub bağlantısı Netlify arayüzünden tamamlanmalıdır.

- Netlify proje adı: `arm-5x5`
- Netlify yönetim: https://app.netlify.com/projects/arm-5x5
- Önceden tahsis edilmiş adres: https://arm-5x5.netlify.app (**ilk deploy tamamlanana kadar canlı değil**)
- Kaynak: https://github.com/runelook65-bit/Strong-5x5
- Dal: `main`
- Kök dosya: `netlify.toml`
- Build: `npm run build`
- Publish: `dist`
- Node: `22`

## İlk yayına alma

1. Netlify projesini aç.
2. **Project configuration → Developer settings → Continuous deployment → Repository → Link repository**.
3. GitHub bağlantısı istenirse yetki ver; `runelook65-bit/Strong-5x5` deposunu seç.
4. `main` dalını, `npm run build` komutunu ve `dist` publish klasörünü doğrula. Kök `netlify.toml` bu ayarları tanımlar.
5. Linklemeyi tamamla; Netlify ilk build/deploy işlemini başlatır.
6. **Deploys** alanında build'in **Ready** durumuna ulaşmasını ve https://arm-5x5.netlify.app adresinin uygulamayı açmasını kontrol et.

## Her GitHub değişikliğini otomatik yayınlamamak

Git repository bağlamak varsayılan olarak **push → build → otomatik deploy** etkinleştirir.

İlk yayın tamamlandıktan sonra:
- **Project configuration → Developer settings → Continuous deployment → Build settings** içinden **Stop builds** ile otomatik build'leri durdur.
- Yeni üretim yayını için Netlify dashboard'dan build'i tekrar aktive et veya manuel CLI deploy kullan.
- CLI ile manuel deploy için önce `npm install && npm run build`; ardından oturum açmış yerel ortamda `netlify deploy --prod --dir=dist --site <SITE_ID>`.
- CLI manuel deploy'un build'i kendiliğinden yapmadığını unutma.

## Teknik doğrulamalar

- Kodun ana HTML ve yerel test dosyaları üzerinde regresyon çalıştırmaları başarılıdır; Netlify production build ve gerçek telefon kontrolü bağımsız olarak henüz doğrulanmadı.
- `npm run build` hata verirse `Deploys → failed build → Deploy log` üzerinden nedeni incele.
- Önemli: Tarayıcıdaki `localStorage` kayıtları alan adı bazlıdır. Eski bir localhost veya başka Netlify domainindeki setler **otomatik taşınmaz**. Önce eski uygulamadan JSON yedeği al, sonra ARM 5×5 Araçlar ekranından geri yükle.
- Giriş/hesap olmadan offline kişisel veri kaydı yapan uygulamada düzenli JSON yedeklemesi kullanıcı sorumluluğundadır.

Netlify arayüz akışı: https://docs.netlify.com/build/git-workflows/repo-permissions-linking/
