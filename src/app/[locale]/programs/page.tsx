import { ProgramCard, SectionHeading } from "@/components/ui";
import { programs } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function ProgramsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Programs Marketplace"
        title="Digital programs built for scalable coaching revenue."
        copy="Users can buy guided training plans for fat loss, performance, muscle gain, and recovery with clean conversion-focused cards."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {programs.map((program) => (
          <ProgramCard key={program.slug} program={program} href={`/${params.locale}/programs/${program.slug}`} />
        ))}
      </div>
    </div>
  );
}
