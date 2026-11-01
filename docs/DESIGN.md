# ARM 5×5 — Tasarım sistemi (Performance)

## Kimlik

**Ürün odağı:** Set kaydetmek saniyeler sürmeli; antrenman esnasında ekranı minimum süre kullanmak temel ilkedir.

| Token | Renk | İşlev |
|---|---|---|
| oled | `#07080a` | Ana zemin |
| card | `#121418` | Kart yüzeyi |
| borderDark | `#232730` | Kart / alan sınırları |
| accentGreen | `#10b981` | Eylem ve başarılı set |
| emerald-300 | Tailwind | Onaylanan veri / geri bildirim |
| amber | `#f59e0b` | Eksik set / dikkat |
| rose | Tailwind | Silme / azaltma |

Yazı ailesi sistem öncelikli `Inter` fallback ve sayısal alanlarda `JetBrains Mono` fallback. Dış font yüklemeden de kullanılabilmesi temel kısıttır.

## Akış ilkeleri

- **Antrenman**: Seçili seans > ilerleme > sıradaki hareket > sonraki set > dinlenme > kaydet.
- Program seçimi ve serbest sayaç ikinci planda, kapanır panellerde.
- Tek dokunuş hedef tekrarı kaydeder; inline `kg / tekrar / kaydet` ile gerçek değer girilir.
- Kayıt sonrası en son girilen set düzenlenebilir. Kaydetme öncesinde her setin doğrulanması zorunlu.
- Ağırlık artışı bir **öneridir**; program ve hazır oluş kurallarıyla hesaplanır.
- Form ipuçları gerektiğinde açılır, ana kartı kaplamaz.
- Grafikler yalnızca gerçek kullanıcı kayıtlarından hesaplanır; boş durumda sıfır veriyi başarı gibi sunmaz.
- Gerçek kol gelişimi yalnızca ölçüm koşulları tutarlıysa karşılaştırılabilir.

## Erişilebilirlik

- `meta viewport` büyütme engelini kaldırır.
- Mobilde ≥44 px etkileşim hedefleri ve görünür klavye odağı.
- Grafik ve seans özetlerinde metinsel karşılık; renge bağımlı geri bildirim yok.
- `prefers-reduced-motion` animasyonları sınırlar.
- Arka planda durdurulan timer `Date.now()` ile geçen gerçek süreyi hesaplar.
- VoiceOver/TalkBack ve farklı metin ölçeği gerçek cihazda test edilmelidir.

## Hedef ekranlar

1. **Workout:** Odaklanmış aktif seans, ilerleme, inline set girişi ve timer.
2. **Program:** A/B şablonları, 12 haftalık takvim, yük yönetimi açıklamaları.
3. **Progress:** Kuvvet geçmişi, haftalık set grafiği, kas yükü, soğuk kol çevresi.
4. **Tools:** Hesaplayıcılar, çalışma ağırlıkları ve JSON veri güvenliği.

## Sonraki sınırlar

Mevcut Vanilla JS arayüzü test edilmeden React, shadcn/ui veya Recharts geçişi yapılmamalıdır. Her mimari dönüşüm öncesinde eski `localStorage` kayıtlarının yedeği ve migration testleri gerekir.

## v0.6 — Performance Logger deneyimi

- **Kompakt satır:** Her sette numara, önceki gerçek performans, toplam kg, tekrar ve kayıt onayı bulunur.
- **Odak:** İlk tamamlanmamış egzersiz otomatik açık; diğer hareketler katlanır.
- **Dinlenme:** Zamanlayıcı Workout içinde açılır. Üstte ikinci bir sabit navigasyon şeridi değildir.
- **Dokunma alanı:** Girişler ve set kaydetme düğmesi en az 44 px; iPhone safe-area ve klavyeye göre alt nav uyarlanır.
- **Gerçek veri:** Program ve Progress yalnızca kullanıcının kayıtlarına göre yüzdeler ve KPI'lar gösterir.
- **Teknik borç:** Gerçek iPhone Safari ve Android tarayıcı üzerinde görünüm ve klavye kabul testleri gerekir.

## v0.7.1 — Precision Glass

**Glassmorphism estetik bir efekt değil, arayüzdeki katmanları ayırma aracıdır.**

### Katmanlar

1. *App canvas:* `#080e12` ve çok hafif yeşil ambient radial gradient.
2. *Hero surface:* `rgba(21,63,49,.75)` → `rgba(14,24,31,.82)`, 20px blur (fallback `#162e27`), 1px düşük opak kenar çizgisi.
3. *Floating navigation:* `rgba(22,31,36,.77)`, 25px blur, kenar ve gölgelerle içerikten ayrılmış tek aktif ikon. iOS `env(safe-area-inset-bottom)`.
4. *Mat kartlar:* Set, hacim, tekrar, grafik, form ve tablo için `#141b21` veya `#0e161b`. Blur özellikle **yok**.
5. *CTA:* Tek parlak mint: `#69edb7 → #40d69b`, koyu `#072216` yazı.

### Uygulama

- `src/v7.css`: temel ekran geometrisi ve işlevsel stiller.
- `src/v7-glass.css`: ürün seviyesinde glass görsel sistem, yalnızca `v7` ve `v8` ekran sınıflarını değiştirir.
- `index.html`: hero watermark SVG, inline erişilebilir SVG ikonlar ve gerçek antrenman durum etiketi.
- Ek font ve ücretli görsel gerekmiyor.
- Kullanıcı kayıtları ve işlevsel veri motoru etkilenmiyor.
- Her cihazda bitmap/mockup eşleşmesi **henüz doğrulanmadı**. Safari üzerindeki blur, SVG thumbnail görselleri ve nav hizası gerçek ekran görüntüsüyle değerlendirilmelidir.

### Görsel regresyon sınırları

- 320px genişlikte başlık ve KG değeri taşmamalı.
- iPhone çentik ve alt home-indicator ile floating nav çakışmamalı.
- Alt sekme aktif odak modunda görünmemeli.
- Reduce Transparency / Reduce Motion etkin olduğunda tüm temel eylemler görünür ve kullanılabilir olmalı.
- Aynı anda en fazla hero + alt dock (Focus ekranında hero + rest) frosted glass taşır; veri kartlarında pahalı blur yok.
