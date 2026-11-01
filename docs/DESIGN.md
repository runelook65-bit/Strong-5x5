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
