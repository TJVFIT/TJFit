import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

/**
 * Diet detail pages live under /programs/[slug].
 * This route transparently redirects so any link to /diets/[slug]
 * (bookmarks, direct URLs) lands on the correct page.
 */
export default function DietSlugPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = requireLocaleParam(params.locale);
  redirect(`/${locale}/programs/${params.slug}`);
}
