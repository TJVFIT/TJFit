import { describe, it, expect } from "vitest";

import { detectMedicalRisk, medicalSafetyResponse } from "@/lib/tjai/guards/medical-safety";

const CATEGORIES = [
  "ed", "extreme_cut", "dosing", "injury_red_flag",
  "self_harm", "pregnancy", "reds", "rhabdo",
  "cardiac_symptoms", "diabetic_hypo", "minors_dieting", "post_surgery_return"
] as const;
const LOCALES = ["en", "tr", "ar", "es", "fr"] as const;

describe("detectMedicalRisk — production safety guard", () => {
  const cases: Array<[string, string]> = [
    ["I want to hurt myself", "self_harm"],
    ["I want to starve myself to lose weight", "ed"],
    ["what dose of testosterone should I take", "dosing"],
    ["my pee is dark brown after leg day", "rhabdo"],
    ["sharp pain in my knee when I squat", "injury_red_flag"],
    ["I'm 20 weeks pregnant, can I keep lifting?", "pregnancy"],
    ["I lost my period since I started cutting", "reds"],
    ["I want to lose 20 pounds in a week", "extreme_cut"]
  ];
  it.each(cases)("flags %j → correct category", (msg, expected) => {
    expect(detectMedicalRisk(msg)?.category).toBe(expected);
  });

  it("prioritises self-harm over a co-occurring ED match (crisis first)", () => {
    expect(detectMedicalRisk("I want to hurt myself and starve myself")?.category).toBe("self_harm");
  });

  it("does NOT flag normal fitness questions", () => {
    expect(detectMedicalRisk("how many sets for hypertrophy?")).toBeNull();
    expect(detectMedicalRisk("what should I eat after a workout?")).toBeNull();
    expect(detectMedicalRisk("")).toBeNull();
  });
});

describe("detectMedicalRisk — cardiac_symptoms (5 locales)", () => {
  const positives: Array<[string, string]> = [
    ["I get chest pain during my workouts, should I push through it?", "en"],
    ["Sharp chest pressure when I'm running on the treadmill", "en"],
    ["My chest hurts and it's spreading down my left arm during squats", "en"],
    ["My heart is racing like crazy and I feel dizzy in the middle of my set", "en"],
    ["Shortness of breath and chest tightness climbing the stairs at the gym", "en"],
    ["Antrenman sırasında göğsümde ağrı oluyor, devam edeyim mi?", "tr"],
    ["Squat yaparken göğsümde baskı ve kolum karıncalanıyor", "tr"],
    ["Egzersiz yaparken kalp çarpıntım oluyor ve baş dönmesi yaşıyorum", "tr"],
    ["أشعر بألم في صدري أثناء التمرين ولا أعرف هل أكمل", "ar"],
    ["عندي ضغط في صدري يمتد إلى ذراعي وأنا أرفع الأثقال", "ar"],
    ["أعاني من خفقان في القلب مع دوخة شديدة بعد الجري", "ar"],
    ["Tengo dolor en el pecho durante el ejercicio, ¿debería seguir?", "es"],
    ["Siento presión en el pecho que se extiende al brazo mientras levanto pesas", "es"],
    ["Tengo palpitaciones y mareo fuerte a mitad de mi entrenamiento", "es"],
    ["J'ai une douleur dans la poitrine pendant l'exercice, je continue ?", "fr"],
    ["Je ressens une pression dans la poitrine qui irradie vers le bras en soulevant", "fr"],
    ["J'ai des palpitations et des vertiges pendant mon entraînement", "fr"]
  ];
  it.each(positives)("flags %j (%s) as cardiac_symptoms", (msg) => {
    expect(detectMedicalRisk(msg)?.category).toBe("cardiac_symptoms");
  });

  it("does NOT flag ordinary training talk that mentions 'chest' or 'heart'", () => {
    expect(detectMedicalRisk("what's a good chest and triceps split for today?")).toBeNull();
    expect(detectMedicalRisk("it's chest day, want a new bench program")).toBeNull();
    expect(detectMedicalRisk("what are my heart rate zones for fat loss cardio?")).toBeNull();
    expect(detectMedicalRisk("my heart was pumping hard after that HIIT session, great workout")).toBeNull();
  });
});

describe("detectMedicalRisk — diabetic_hypo (5 locales)", () => {
  const positives: Array<[string, string]> = [
    ["What insulin dose should I take before my workout today?", "en"],
    ["Should I lower my insulin around training days?", "en"],
    ["My blood sugar dropped mid-workout and I felt shaky and sweating", "en"],
    ["I'm shaking and confused right now, might be low blood sugar", "en"],
    ["Antrenmandan önce ne kadar insülin dozu almalıyım?", "tr"],
    ["Egzersiz sırasında şekerim düştü, titriyorum ve terliyorum", "tr"],
    ["كم جرعة الأنسولين التي يجب أن آخذها قبل التمرين؟", "ar"],
    ["سكر الدم عندي انخفض أثناء التمرين وأنا أرتجف وأتعرق", "ar"],
    ["¿Qué dosis de insulina debo tomar antes del entrenamiento?", "es"],
    ["Se me bajó el azúcar durante el ejercicio, estoy temblando y sudando", "es"],
    ["Quelle dose d'insuline dois-je prendre avant l'entraînement ?", "fr"],
    ["Ma glycémie a chuté pendant l'entraînement, je tremble et je transpire", "fr"]
  ];
  it.each(positives)("flags %j (%s) as diabetic_hypo", (msg) => {
    expect(detectMedicalRisk(msg)?.category).toBe("diabetic_hypo");
  });

  it("does NOT flag ordinary cravings or nutrition talk", () => {
    expect(detectMedicalRisk("I keep getting sugar cravings in the evening, any tips?")).toBeNull();
    expect(detectMedicalRisk("what's a good post-workout protein shake?")).toBeNull();
  });
});

describe("detectMedicalRisk — minors_dieting (5 locales)", () => {
  const positives: Array<[string, string]> = [
    ["I'm 14 and I want to lose weight fast, what calorie deficit should I do?", "en"],
    ["I am 13 years old, can you make me a cutting diet?", "en"],
    ["At 15 years old, what's a safe calorie deficit for me?", "en"],
    ["13 yaşındayım ve kilo vermek istiyorum, bana kalori açığı verir misin?", "tr"],
    ["عمري 12 وأريد نظام غذائي لأنقص وزني بسرعة", "ar"],
    ["Tengo 14 años y quiero un déficit calórico para bajar de peso rápido", "es"],
    ["J'ai 13 ans et je veux un déficit calorique pour maigrir vite", "fr"]
  ];
  it.each(positives)("flags %j (%s) as minors_dieting", (msg) => {
    expect(detectMedicalRisk(msg)?.category).toBe("minors_dieting");
  });

  it("does NOT flag adult program-duration or unrelated age mentions", () => {
    expect(detectMedicalRisk("I'm 16 weeks into the program and want to cut calories now")).toBeNull();
    expect(detectMedicalRisk("I'm 32 and want a calorie deficit to cut for summer")).toBeNull();
    expect(detectMedicalRisk("I'm 14kg overweight, what deficit should I aim for?")).toBeNull();
  });
});

describe("detectMedicalRisk — post_surgery_return (5 locales)", () => {
  const positives: Array<[string, string]> = [
    ["I had knee surgery 3 weeks ago, when can I start squatting again?", "en"],
    ["2 weeks post-op ACL surgery, is it okay to start lifting?", "en"],
    ["Had shoulder surgery last month, when can I go back to bench press?", "en"],
    ["2 hafta önce ameliyat oldum, ne zaman antrenmana başlayabilirim?", "tr"],
    ["أجريت عملية جراحية منذ أسبوعين، متى يمكنني العودة للتمرين؟", "ar"],
    ["Me hicieron una cirugía hace dos semanas, ¿cuándo puedo volver a entrenar?", "es"],
    ["J'ai eu une chirurgie il y a deux semaines, quand puis-je reprendre l'entraînement ?", "fr"]
  ];
  it.each(positives)("flags %j (%s) as post_surgery_return", (msg) => {
    expect(detectMedicalRisk(msg)?.category).toBe("post_surgery_return");
  });

  it("does NOT flag a surgeon's past clearance (no recent-surgery + return question)", () => {
    expect(detectMedicalRisk("my surgeon cleared me last year, can I go back to heavy squats?")).toBeNull();
    expect(detectMedicalRisk("I'm 16 weeks into the program")).toBeNull();
  });
});

describe("medicalSafetyResponse — crisis copy exists in every supported language", () => {
  for (const cat of CATEGORIES) {
    for (const loc of LOCALES) {
      it(`${cat} / ${loc} returns a real localized response`, () => {
        const r = medicalSafetyResponse(cat, loc);
        expect(typeof r).toBe("string");
        expect(r.trim().length).toBeGreaterThan(20);
      });
    }
  }

  it("falls back to English for an unsupported locale", () => {
    expect(medicalSafetyResponse("self_harm", "de")).toBe(medicalSafetyResponse("self_harm", "en"));
  });
});
