import type { Metadata } from "next";

import { AmbientBackground } from "@/components/ui/AmbientBackground";
import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

const COPY: Record<Locale, { title: string; updated: string; intro: string; sections: Array<{ heading: string; body: string[] }>; ack: string }> = {
  en: {
    title: "Health Disclaimer",
    updated: "Last updated: 2026-05-02",
    intro:
      "TJFit provides fitness and nutrition content for educational and motivational purposes. It is not medical advice. Read this carefully before using any program, diet, or TJAI plan.",
    sections: [
      {
        heading: "Not a substitute for medical care",
        body: [
          "TJFit is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a licensed physician before starting any exercise or nutrition program — especially if you have a pre-existing condition (cardiovascular disease, diabetes, pregnancy, eating disorder, recent surgery, joint injury, etc.).",
          "If you experience pain, dizziness, shortness of breath, or any unusual symptom while training, stop immediately and seek medical attention."
        ]
      },
      {
        heading: "TJAI is an AI tool, not a clinician",
        body: [
          "TJAI is an artificial-intelligence assistant that builds plans based on the answers you provide. It cannot examine you, diagnose conditions, or replace clinical judgment. Treat its output as a starting framework — not a medical prescription.",
          "Do not use TJAI for medical questions. If TJAI ever appears to be giving medical advice, refuse the suggestion and consult a doctor."
        ]
      },
      {
        heading: "Coaches are independent fitness professionals",
        body: [
          "Coaches on TJFit are certified fitness professionals providing coaching services. They are independent contractors, not employees of TJFit, and they do not provide medical care. Their coaching does not constitute a doctor-patient relationship."
        ]
      },
      {
        heading: "Your responsibility",
        body: [
          "You are responsible for your own health and safety. By using TJFit you accept that exercise and nutrition changes carry inherent risks, and that you assume those risks voluntarily.",
          "Modify or skip any movement that hurts. Use a spotter when training near maximal loads. Train within your capacity. Hydrate, eat enough, sleep enough."
        ]
      },
      {
        heading: "Minors",
        body: [
          "Users under 16 are not permitted on TJFit. Users 16–17 may use the platform with verifiable parental or guardian consent and may not access paid features or coach services."
        ]
      }
    ],
    ack:
      "I have read and understood the Health Disclaimer. I will consult my physician before starting any TJFit program, diet, or TJAI plan if I have any pre-existing condition."
  },
  tr: {
    title: "Sağlık Sorumluluk Reddi",
    updated: "Son güncelleme: 2026-05-02",
    intro:
      "TJFit; eğitim ve motivasyon amaçlı fitness ve beslenme içeriği sunar. Tıbbi tavsiye değildir. Herhangi bir programı, diyeti veya TJAI planını kullanmadan önce bu metni dikkatlice oku.",
    sections: [
      {
        heading: "Tıbbi bakımın yerini tutmaz",
        body: [
          "TJFit; profesyonel tıbbi tavsiye, tanı veya tedavinin yerini tutmaz. Herhangi bir egzersiz veya beslenme programına başlamadan önce — özellikle önceden bir rahatsızlığın varsa (kalp-damar hastalığı, diyabet, hamilelik, yeme bozukluğu, yakın zamanda ameliyat, eklem yaralanması vb.) — mutlaka lisanslı bir hekime danış.",
          "Antrenman sırasında ağrı, baş dönmesi, nefes darlığı veya alışılmadık bir belirti yaşarsan derhal dur ve tıbbi yardım al."
        ]
      },
      {
        heading: "TJAI bir yapay zeka aracıdır; klinisyen değildir",
        body: [
          "TJAI verdiğin cevaplara göre plan oluşturan bir yapay zeka asistanıdır. Seni muayene edemez, tanı koyamaz veya klinik yargının yerine geçemez. Çıktısını tıbbi bir reçete değil, başlangıç çerçevesi olarak kullan.",
          "TJAI'yi tıbbi sorular için kullanma. Bir önerinin tıbbi tavsiye gibi görünmesi durumunda öneriyi reddet ve doktora danış."
        ]
      },
      {
        heading: "Koçlar bağımsız fitness uzmanlarıdır",
        body: [
          "TJFit koçları, koçluk hizmeti veren sertifikalı fitness profesyonelleridir. TJFit çalışanı değil bağımsız yüklenicilerdir; tıbbi bakım sağlamazlar. Koçlukları doktor-hasta ilişkisi oluşturmaz."
        ]
      },
      {
        heading: "Senin sorumluluğun",
        body: [
          "Kendi sağlığın ve güvenliğin senin sorumluluğundadır. TJFit'i kullanarak egzersizin ve beslenme değişikliğinin doğal riskler taşıdığını kabul edersin.",
          "Acıtan herhangi bir hareketi modifiye et veya atla. Maksimal yüklerin yakınında çalışırken spotter kullan. Kapasiten dahilinde çalış. Yeterince su iç, ye, uyu."
        ]
      },
      {
        heading: "Reşit olmayanlar",
        body: [
          "16 yaş altı kullanıcılar TJFit'e kabul edilmez. 16–17 yaş arası kullanıcılar doğrulanmış ebeveyn/veli izniyle platformu kullanabilir; ücretli özelliklere ve koç hizmetlerine erişemez."
        ]
      }
    ],
    ack:
      "Sağlık Sorumluluk Reddi'ni okudum ve anladım. Önceden bir rahatsızlığım varsa, herhangi bir TJFit programına, diyetine veya TJAI planına başlamadan önce hekimime danışacağım."
  },
  ar: {
    title: "إخلاء المسؤولية الصحية",
    updated: "آخر تحديث: 2026-05-02",
    intro:
      "تقدّم TJFit محتوى لياقة وتغذية لأغراض تعليمية وتحفيزية. ليست استشارة طبية. اقرأ هذه الوثيقة بعناية قبل استخدام أي برنامج أو نظام غذائي أو خطة TJAI.",
    sections: [
      {
        heading: "ليست بديلاً عن الرعاية الطبية",
        body: [
          "TJFit ليست بديلاً عن الاستشارة الطبية المهنية أو التشخيص أو العلاج. استشر طبيباً مرخصاً قبل البدء بأي برنامج تمارين أو تغذية — خاصة إذا كنت تعاني من حالة مسبقة (أمراض القلب، السكري، الحمل، اضطراب أكل، عمليات حديثة، إصابة مفصلية، إلخ).",
          "إذا شعرت بألم، دوار، ضيق تنفس، أو أي عرض غير معتاد أثناء التمرين، توقف فوراً واطلب المساعدة الطبية."
        ]
      },
      {
        heading: "TJAI أداة ذكاء اصطناعي، ليست طبيباً",
        body: [
          "TJAI مساعد ذكاء اصطناعي يبني خططاً بناءً على إجاباتك. لا يمكنه فحصك أو تشخيص حالات أو استبدال الحكم السريري. تعامل مع مخرجاته كإطار بداية — لا كوصفة طبية.",
          "لا تستخدم TJAI للأسئلة الطبية. إذا بدا أنه يقدّم نصيحة طبية، ارفض الاقتراح واستشر طبيباً."
        ]
      },
      {
        heading: "المدربون مهنيون لياقة مستقلون",
        body: [
          "المدربون على TJFit مهنيو لياقة معتمدون يقدّمون خدمات تدريب. هم متعاقدون مستقلون وليسوا موظفين لدى TJFit، ولا يقدّمون رعاية طبية. تدريبهم لا يشكّل علاقة طبيب-مريض."
        ]
      },
      {
        heading: "مسؤوليتك",
        body: [
          "أنت مسؤول عن صحتك وسلامتك. باستخدامك TJFit تقبل أن للتمارين وتغييرات التغذية مخاطر متأصلة، وأنك تتحمّل تلك المخاطر طوعاً.",
          "عدّل أو تخطّ أي حركة تؤلمك. استخدم مساعداً (spotter) عند التدريب قرب الأحمال القصوى. تدرّب ضمن قدرتك. اشرب الماء، تناول الطعام، نَم بقدر كافٍ."
        ]
      },
      {
        heading: "القاصرون",
        body: [
          "غير مسموح لمن هم دون 16 عاماً باستخدام TJFit. مستخدمو 16–17 عاماً يمكنهم استخدام المنصة بموافقة ولي أمر موثّقة، ولا يمكنهم الوصول إلى الميزات المدفوعة أو خدمات المدرب."
        ]
      }
    ],
    ack:
      "قرأت إخلاء المسؤولية الصحية وفهمته. سأستشير طبيبي قبل البدء بأي برنامج TJFit أو نظام غذائي أو خطة TJAI إذا كنت أعاني من أي حالة مسبقة."
  },
  es: {
    title: "Aviso de salud",
    updated: "Última actualización: 2026-05-02",
    intro:
      "TJFit ofrece contenido de fitness y nutrición con fines educativos y motivacionales. No es consejo médico. Lee esto con atención antes de usar cualquier programa, dieta o plan TJAI.",
    sections: [
      {
        heading: "No reemplaza la atención médica",
        body: [
          "TJFit no reemplaza el consejo, diagnóstico o tratamiento médico profesional. Consulta a un médico antes de comenzar cualquier programa de ejercicio o nutrición — especialmente si tienes una condición preexistente (enfermedad cardiovascular, diabetes, embarazo, trastorno alimentario, cirugía reciente, lesión articular, etc.).",
          "Si sientes dolor, mareo, falta de aire o cualquier síntoma inusual durante el entrenamiento, detente y busca atención médica."
        ]
      },
      {
        heading: "TJAI es una herramienta de IA, no un clínico",
        body: [
          "TJAI es un asistente de inteligencia artificial que construye planes según tus respuestas. No puede examinarte, diagnosticar condiciones ni reemplazar el juicio clínico. Trata su salida como un marco inicial — no como una receta médica.",
          "No uses TJAI para preguntas médicas. Si parece dar consejo médico, rechaza la sugerencia y consulta a un doctor."
        ]
      },
      {
        heading: "Los coaches son profesionales independientes",
        body: [
          "Los coaches de TJFit son profesionales certificados que ofrecen servicios de coaching. Son contratistas independientes, no empleados de TJFit, y no proporcionan atención médica. Su coaching no constituye una relación médico-paciente."
        ]
      },
      {
        heading: "Tu responsabilidad",
        body: [
          "Eres responsable de tu propia salud y seguridad. Al usar TJFit aceptas que el ejercicio y los cambios nutricionales conllevan riesgos inherentes y que asumes esos riesgos voluntariamente.",
          "Modifica o salta cualquier movimiento que duela. Usa un spotter al entrenar cerca de cargas máximas. Entrena dentro de tu capacidad. Hidrátate, come y duerme suficiente."
        ]
      },
      {
        heading: "Menores",
        body: [
          "Los usuarios menores de 16 no están permitidos en TJFit. Los de 16–17 pueden usar la plataforma con consentimiento parental verificable y no pueden acceder a funciones de pago ni servicios de coach."
        ]
      }
    ],
    ack:
      "He leído y entendido el Aviso de Salud. Consultaré a mi médico antes de comenzar cualquier programa, dieta o plan TJAI si tengo alguna condición preexistente."
  },
  fr: {
    title: "Avis de santé",
    updated: "Dernière mise à jour : 2026-05-02",
    intro:
      "TJFit propose du contenu fitness et nutrition à des fins éducatives et motivationnelles. Ce n'est pas un avis médical. Lis ceci attentivement avant d'utiliser tout programme, régime ou plan TJAI.",
    sections: [
      {
        heading: "Ne remplace pas un suivi médical",
        body: [
          "TJFit ne remplace pas un avis, un diagnostic ou un traitement médical professionnel. Consulte un médecin avant de commencer tout programme d'exercice ou de nutrition — surtout en cas de condition préexistante (maladie cardiovasculaire, diabète, grossesse, trouble alimentaire, opération récente, blessure articulaire, etc.).",
          "Si tu ressens douleur, vertige, essoufflement ou tout symptôme inhabituel pendant l'entraînement, arrête et consulte."
        ]
      },
      {
        heading: "TJAI est une IA, pas un clinicien",
        body: [
          "TJAI est un assistant d'intelligence artificielle qui construit des plans à partir de tes réponses. Il ne peut pas t'examiner, diagnostiquer ou remplacer le jugement clinique. Traite ses résultats comme un cadre de départ — pas comme une prescription.",
          "N'utilise pas TJAI pour des questions médicales. S'il semble donner un avis médical, ignore la suggestion et consulte un médecin."
        ]
      },
      {
        heading: "Les coachs sont des professionnels indépendants",
        body: [
          "Les coachs sur TJFit sont des professionnels certifiés offrant des services de coaching. Ils sont des sous-traitants indépendants, pas des salariés de TJFit, et ne fournissent pas de soins médicaux. Leur coaching ne constitue pas une relation médecin-patient."
        ]
      },
      {
        heading: "Ta responsabilité",
        body: [
          "Tu es responsable de ta propre santé et sécurité. En utilisant TJFit tu acceptes que l'exercice et les changements nutritionnels comportent des risques inhérents et que tu les assumes volontairement.",
          "Modifie ou saute tout mouvement qui te fait mal. Utilise un partenaire (spotter) près des charges maximales. Entraîne-toi dans ta capacité. Hydrate-toi, mange et dors suffisamment."
        ]
      },
      {
        heading: "Mineurs",
        body: [
          "Les utilisateurs de moins de 16 ans ne sont pas admis sur TJFit. Ceux de 16–17 ans peuvent utiliser la plateforme avec consentement parental vérifiable et ne peuvent pas accéder aux fonctionnalités payantes ni aux services de coach."
        ]
      }
    ],
    ack:
      "J'ai lu et compris l'Avis de Santé. Je consulterai mon médecin avant de commencer tout programme, régime ou plan TJAI si j'ai une condition préexistante."
  }
};

const PAGE_METADATA: Record<Locale, { title: string; description: string }> = {
  en: { title: "Health Disclaimer | TJFit", description: "TJFit fitness, nutrition and TJAI plans are educational. Read the safety boundaries before training." },
  tr: { title: "Sağlık Sorumluluk Reddi | TJFit", description: "TJFit fitness, beslenme ve TJAI planları eğitim amaçlıdır. Antrenmana başlamadan önce güvenlik sınırlarını oku." },
  ar: { title: "إخلاء المسؤولية الصحية | TJFit", description: "محتوى TJFit للياقة والتغذية وخطط TJAI تعليمي. اقرأ حدود السلامة قبل التدريب." },
  es: { title: "Aviso de Salud | TJFit", description: "El contenido de fitness, nutrición y planes TJAI de TJFit es educativo. Lee los límites de seguridad antes de entrenar." },
  fr: { title: "Avis de Santé | TJFit", description: "Le contenu fitness, nutrition et plans TJAI de TJFit est éducatif. Lis les limites de sécurité avant de t'entraîner." }
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = requireLocaleParam(params.locale);
  const meta = PAGE_METADATA[locale] ?? PAGE_METADATA.en;
  return { title: meta.title, description: meta.description };
}

export default function HealthDisclaimerPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = COPY[locale] ?? COPY.en;
  return (
    <>
      <AmbientBackground variant="violet" />
      <div className="relative z-[1] mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-warning">{copy.title}</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-2 text-xs text-faint">{copy.updated}</p>
        <p className="mt-6 text-base leading-relaxed text-muted">{copy.intro}</p>

        <div className="mt-10 space-y-8">
          {copy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-semibold tracking-tight text-white">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-[1.8] text-muted">
                {section.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-warning/30 bg-warning/[0.05] p-6">
          <p className="text-sm font-semibold text-white">{copy.ack}</p>
        </div>
      </div>
    </>
  );
}
