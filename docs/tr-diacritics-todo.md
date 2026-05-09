# Stripped Turkish Diacritics — Pending Native Review

**Status:** Tracked debt. Joseph (native Turkish speaker) will review and apply.
**Scope:** All hits below are user-visible Turkish copy with stripped diacritics (ç → c, ğ → g, ı → i, ö → o, ş → s, ü → u). Best-guess corrections provided; review each one before applying.
**Out of scope:** ASCII slugs/keys (e.g., URL fragments, i18n keys, JSON property names) — none of the hits below are slugs.
**Already fixed in this PR:** `src/components/coming-soon-launch-page.tsx` lines 42–66 (the audit's P5 finding).

Generated: 2026-05-08, against base `c1c82de`.

---

## Convention

| Form | Letter | Example |
|---|---|---|
| `c` | ç | `icin` → `için` |
| `g` | ğ | `dogru` → `doğru` |
| `i` | ı | `yakinda` → `yakında` |
| `o` | ö | `donusum` → `dönüşüm` |
| `s` | ş | `sifre` → `şifre` |
| `u` | ü | `uyelik` → `üyelik` |

---

## Files (19) — 41 hits

### `src/components/admin-coach-authorization.tsx`

- **L41** — `"Koc hesabi olusturmak icin e-posta ve sifre girin. Ardindan koc paneline giris yapabilirler."`
  → `"Koç hesabı oluşturmak için e-posta ve şifre girin. Ardından koç paneline giriş yapabilirler."`
- **L46** — `"Koc yetkilendirildi. Artik bu e-posta ve sifre ile giris yapabilir."`
  → `"Koç yetkilendirildi. Artık bu e-posta ve şifre ile giriş yapabilir."`

### `src/components/become-coach-application-form.tsx`

- **L10** — `"Basvurun alindi. 48 saat icinde sizinle iletisime gececegiz."`
  → `"Başvurun alındı. 48 saat içinde sizinle iletişime geçeceğiz."`

### `src/lib/coach-terms-copy.ts`

- **L106** — `"Danisan iletisimi"` → `"Danışan iletişimi"`

### `src/lib/feature-copy.ts`

- **L189** — `"Uctan uca sifreli"` → `"Uçtan uca şifreli"`

### `src/lib/free-product-pages.ts`

- **L181** — `"Pzt / Car / Cum icin Gun A / B / C donusumunu uygulayin."`
  → `"Pzt / Çar / Cum için Gün A / B / C dönüşümünü uygulayın."`
- **L194** — `"Baslangici tamamladiniz. Tam 12 haftalik Ev Yag Yakim programi gunluk antrenmanlar, tam ilerleme, ileri teknikler ve donusum planinizi icerir."`
  → `"Başlangıcı tamamladınız. Tam 12 haftalık Ev Yağ Yakım programı günlük antrenmanlar, tam ilerleme, ileri teknikler ve dönüşüm planınızı içerir."`
- **L328** — `"Baslangici tamamladiniz. Tam 12 haftalik Salon Kas programi 6 gunluk bolunme, ileri progresif asiri yukleme ve tam kas gelistirme sisteminizi icerir."`
  → `"Başlangıcı tamamladınız. Tam 12 haftalık Salon Kas programı 6 günlük bölünme, ileri progresif aşırı yükleme ve tam kas geliştirme sisteminizi içerir."`
- **L426** — `"Hafta 1 gunluk: ~1800 kcal | ~120P / ~123KH / ~44Y"`
  → `"Hafta 1 günlük: ~1800 kcal | ~120P / ~123KH / ~44Y"`
- **L448** — `"Bu baslangic temeli verir. Tam 12 haftalik Temiz Definisyon diyeti gunluk ogunler, tam makro takibi, haftalik kalori dongusu ve her yiyecek icin alternatifler icerir."`
  → `"Bu başlangıç temeli verir. Tam 12 haftalık Temiz Definisyon diyeti günlük öğünler, tam makro takibi, haftalık kalori döngüsü ve her yiyecek için alternatifler içerir."`
  *(Note: "Definisyon" appears stylized; verify whether you want "Definasyon" / "Definition" / "Tanım".)*
- **L551** — `"Hafta 1 gunluk: ~2800 kcal | ~185P / ~306KH / ~73Y"`
  → `"Hafta 1 günlük: ~2800 kcal | ~185P / ~306KH / ~73Y"`
- **L569** — `"Yeni gunluk toplam: ~2950 kcal."`
  → `"Yeni günlük toplam: ~2950 kcal."`
- **L582** — `"Bu baslangic lean kas kazanimi icin temeldir. Tam 12 haftalik Lean Bulk diyeti gunluk ogunler, tarifler, pisirme suresi, haftalik kalori ilerlemesi ve alternatifler icerir."`
  → `"Bu başlangıç lean kas kazanımı için temeldir. Tam 12 haftalık Lean Bulk diyeti günlük öğünler, tarifler, pişirme süresi, haftalık kalori ilerlemesi ve alternatifler içerir."`

### `src/lib/launch-copy.ts`

- **L747** — `"Daha akilli antrenman. Daha iyi beslenme. Daha hizli donusum."`
  → `"Daha akıllı antrenman. Daha iyi beslenme. Daha hızlı dönüşüm."`
- **L748** — same as L747 (duplicate string).
- **L761** — `"Destek iletisim"` → `"Destek iletişim"`
- **L764** — `"(Cok yakinda)"` → `"(Çok yakında)"`
- **L1091** — `"Bir koç hesabi olusturmak icin e-posta ve sifre gir. Giris yapip koç paneline erisebilirler."`
  → `"Bir koç hesabı oluşturmak için e-posta ve şifre gir. Giriş yapıp koç paneline erişebilirler."`

### `src/app/api/free/download/route.ts`

- **L116** — `"Uyku ve toparlanma: 7-9 saat uyku, gunluk 2.5-3.5 L su ve mumkunse 7k-10k adim hedefleyin."`
  → `"Uyku ve toparlanma: 7-9 saat uyku, günlük 2.5-3.5 L su ve mümkünse 7k-10k adım hedefleyin."`

### `src/app/[locale]/programs/page.tsx`

- **L141** — `"TJAI; hedefin, ekipmanin ve gecmisinden iki dakikada program secer."`
  → `"TJAI; hedefin, ekipmanın ve geçmişinden iki dakikada program seçer."`

### `src/lib/legal-copy.ts`

- **L86** — `"2. Uygunluk ve Hesap Guvenligi"` (heading), `"Dogru bilgi vermeli, giris bilgilerini korumali ve hesabindaki islemlerden sorumlu olmalisin."`, `"Dolandiricilik, kotuye kullanim veya yasa disi faaliyetlerde kullanilan hesaplar askiya alinabilir."`
  → `"2. Uygunluk ve Hesap Güvenliği"`, `"Doğru bilgi vermeli, giriş bilgilerini korumalı ve hesabındaki işlemlerden sorumlu olmalısın."`, `"Dolandırıcılık, kötüye kullanım veya yasa dışı faaliyetlerde kullanılan hesaplar askıya alınabilir."`

### `src/lib/legal-hub-copy.ts`

- **L89** — `"TJFit; ev ve salon icin, gercek bir antrenor plani gibi yapilandirilmis tam 12 haftalik antrenman programlari ve diyet sistemleri sunan premium bir donusum platformudur."`
  → `"TJFit; ev ve salon için, gerçek bir antrenör planı gibi yapılandırılmış tam 12 haftalık antrenman programları ve diyet sistemleri sunan premium bir dönüşüm platformudur."`
- **L93** (`free-start`), **L94**, **L98**, **L99**, **L108**, **L109** — broader Q/A copy in same file also affected; review the full `faqTr` block 85–141 in one pass.
- **L104** — `"Her plan; gunluk ogunler, malzemeler, kalori, makrolar ve basit hazirlik notlari sunar. Haftalik kalori ayarlari ilerleme icin yerlesiktir."`
  → `"Her plan; günlük öğünler, malzemeler, kalori, makrolar ve basit hazırlık notları sunar. Haftalık kalori ayarları ilerleme için yerleşiktir."`
- **L138** — `"Destek ile nasil iletisime gecerim?"` → `"Destek ile nasıl iletişime geçerim?"`
- **L166** — `"1. Toplanan veriler: ad, e-posta, fitness tercihleri ve program kullanimi. Odeme karti numaralari toplanmaz (Paddle isler)."`
  → `"1. Toplanan veriler: ad, e-posta, fitness tercihleri ve program kullanımı. Ödeme kartı numaraları toplanmaz (Paddle işler)."`
- **L167** — `"2. Kullanim: TJFit'i sunmak ve gelistirmek; hesap bildirimleri. Verilerinizi satmayiz."`
  → `"2. Kullanım: TJFit'i sunmak ve geliştirmek; hesap bildirimleri. Verilerinizi satmayız."`
- **L168** — `"3. Saklama: veriler Supabase uzerinde sifreli sunucularda guvenle tutulur."`
  → `"3. Saklama: veriler Supabase üzerinde şifreli sunucularda güvenle tutulur."`
- **L169** — `"4. Haklariniz: dilediginiz zaman veri aktarimi veya silme talep edebilirsiniz. Iletisim: support@tjfit.org."`
  → `"4. Haklarınız: dilediğiniz zaman veri aktarımı veya silme talep edebilirsiniz. İletişim: support@tjfit.org."`
  *(Email already fixed; only diacritics remain.)*
- **L170** — `"5. Cerezler: yalnizca kimlik dogrulama icin cerez kullaniriz. Reklam cerezi yoktur."`
  → `"5. Çerezler: yalnızca kimlik doğrulama için çerez kullanırız. Reklam çerezi yoktur."`
- **L314** — `"1. Uygunluk — TJFit 16 yas ve uzeri icindir."`
  → `"1. Uygunluk — TJFit 16 yaş ve üzeri içindir."`

### `src/lib/membership-tier-copy.ts`

- **L65** — `"Tek seferlik TJAI plan uretimi ayri bir $10 kilididir. Pro ve Apex surekli koçluk ve premium uyelik degeri ekler."`
  → `"Tek seferlik TJAI plan üretimi ayrı bir $10 kilididir. Pro ve Apex sürekli koçluk ve premium üyelik değeri ekler."`

### `src/lib/premium-public-copy.ts`

- **L175** — `"Tam erisim uyeligi cok yakinda"` → `"Tam erişim üyeliği çok yakında"`
- **L181** — `"Cok yakinda"` → `"Çok yakında"`

### `src/lib/program-catalog.ts`

- **L162** — `{ ..., hybrid: "Lean donusum sistemi" }` → `{ ..., hybrid: "Lean dönüşüm sistemi" }`
  *(Other strings in the same line — "Evde definasyon sistemi", "Salonda definasyon sistemi" — kept as-is; "definasyon" appears intentional stylization, not stripped diacritics.)*

### `src/lib/program-elite-meta.ts`

- **L209** — `"Yorgunluk yonetimi"` → `"Yorgunluk yönetimi"`
- **L225** — `"Enerji ve yogunluk"` → `"Enerji ve yoğunluk"`

### `src/lib/program-localization.ts`

- **L146** — `"Yuksek Yogunluklu Yag Yakim (12 Hafta)"` → `"Yüksek Yoğunluklu Yağ Yakım (12 Hafta)"`
- **L396** — `` `${goal} odakli, gunluk uygulanabilir ve surdurulebilir aliskanliklarla ilerleme saglayan yapilandirilmis bir beslenme plani.` ``
  → `` `${goal} odaklı, günlük uygulanabilir ve sürdürülebilir alışkanlıklarla ilerleme sağlayan yapılandırılmış bir beslenme planı.` ``

### `src/lib/program-quality-copy.ts`

- **L25** — `"Kalori hedefini gunluk ±100 kcal araliginda tut. Haftalik trendi esas al, tek gunluk dalgalanmaya takilma."`
  → `"Kalori hedefini günlük ±100 kcal aralığında tut. Haftalık trendi esas al, tek günlük dalgalanmaya takılma."`
- **L26** — `"Protein hedefi: genelde 1.6-2.2 g/kg/gun. Ogunlere dagit ve her ana ogunde kaliteli protein tut."`
  → `"Protein hedefi: genelde 1.6-2.2 g/kg/gün. Öğünlere dağıt ve her ana öğünde kaliteli protein tut."`
- **L40** — `"Aclik/enerji performansi: 1-10 puanla gunluk not al."`
  → `"Açlık/enerji performansı: 1-10 puanla günlük not al."`

### `src/components/shell/site-side-overlay.tsx`

- **L75** — `Live: "Canli"` → `Live: "Canlı"`

### `src/components/start-funnel-client.tsx`

- **L83** — `"Plan kilidinden sonra sinirsiz TJAI sohbeti, uyelik avantajlari ve daha derin kocluk."`
  → `"Plan kilidinden sonra sınırsız TJAI sohbeti, üyelik avantajları ve daha derin koçluk."`

### `src/lib/tjai/guards/fitness-domain.ts`

- **L75** — `"Hizli plan: 3-4 gun kuvvet + gunluk adim hedefi + protein odakli beslenme ile basla. Her hafta agirlik veya tekrar arttir, 7-9 saat uyku ve duzenli su tuketimi ekle. Saglik sorunun varsa doktoruna danis."`
  → `"Hızlı plan: 3-4 gün kuvvet + günlük adım hedefi + protein odaklı beslenme ile başla. Her hafta ağırlık veya tekrar arttır, 7-9 saat uyku ve düzenli su tüketimi ekle. Sağlık sorunun varsa doktoruna danış."`

---

## Notes

- **Inconsistency:** the codebase already uses `koç` (with ç) in many places (e.g., `coming-soon-launch-page.tsx` line 57: `"Koçun"`) but `koc` in others. After the cleanup, grep `\bkoc\b` (word-boundary) to confirm no stragglers.
- **Recommended sweep command** after fixing: `grep -rnE "\b(yakinda|donus|gunluk|ogrenci|cozum|gunde|bugun|sifre|uyelik|iletisim|gecmis|canli|olusturmak|basvurun|alindi|icinde|gececegiz|odakli|yapilandirilmis|akilli|sinirsiz|kocluk)\b" src/` — should return zero hits when complete.
- **i18n tests:** none currently. Worth adding a CI check that greps for these stripped forms and fails the build to prevent regressions.
