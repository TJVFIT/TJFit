import { isLocale } from "@/lib/i18n";

export default function SupportPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const copy =
    params.locale === "tr"
      ? {
          badge: "Destek",
          title: "Destek Iletisimi",
          subtitle: "Destek icin bize e-posta gonderebilirsiniz."
        }
      : params.locale === "ar"
        ? {
            badge: "الدعم",
            title: "التواصل مع الدعم",
            subtitle: "للدعم يمكنك التواصل معنا عبر البريد."
          }
        : params.locale === "es"
          ? {
              badge: "Soporte",
              title: "Contacto de Soporte",
              subtitle: "Para soporte, puedes escribirnos por correo."
            }
          : params.locale === "fr"
            ? {
                badge: "Support",
                title: "Contact Support",
                subtitle: "Pour le support, vous pouvez nous envoyer un email."
              }
            : {
                badge: "Support",
                title: "Support Contact",
                subtitle: "For support, you can email us directly."
              };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[36px] p-8 text-center">
        <span className="badge">{copy.badge}</span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{copy.subtitle}</p>
        <a
          href="mailto:tjfit.org@gmail.com"
          className="mt-6 inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
        >
          tjfit.org@gmail.com
        </a>
      </div>
    </div>
  );
}
