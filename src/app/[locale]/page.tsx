import { LuxuryHome } from "@/components/luxury/luxury-home";
import { coaches, programs } from "@/lib/content";
import { getHomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { isLocale, type Locale } from "@/lib/i18n";

export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;
  const copy = getHomeLuxuryCopy(locale);
  const programPreviews = programs.slice(0, 4).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    duration: p.duration,
    price: p.price
  }));
  const coachPreviews = coaches.slice(0, 4).map((c) => ({
    slug: c.slug,
    name: c.name,
    specialty: c.specialty,
    rating: c.rating
  }));

  return <LuxuryHome locale={locale} copy={copy} programs={programPreviews} coaches={coachPreviews} />;
}
