import type { Locale } from "@/lib/i18n";

type ProgramUploadCopy = {
  onlyAdminsAndCoaches: string;
  titleAndPdfRequired: string;
  coachLimitReached: string;
  uploadFailed: string;
  deleteFailed: string;
  uploadSuccess: string;
  deleteSuccess: string;
  badge: string;
  title: string;
  subtitle: string;
  coachLimitLabel: string;
  titlePlaceholder: string;
  programOption: string;
  dietOption: string;
  uploading: string;
  upload: string;
  activeUploads: string;
  noUploads: string;
  dietLabel: string;
  programLabel: string;
  delete: string;
  uploadCtaTitle: string;
  noProgramsPublished: string;
  uploadedProgramPreview: string;
  uploadedPdfAsset: string;
  translatedPackAsset: string;
};

const copy: Record<Locale, ProgramUploadCopy> = {
  en: {
    onlyAdminsAndCoaches: "Only admin and coach accounts can upload programs.",
    titleAndPdfRequired: "Title and PDF are required.",
    coachLimitReached: "Coach upload limit reached (max 3 active programs). Delete one first.",
    uploadFailed: "Upload failed.",
    deleteFailed: "Unable to delete program.",
    uploadSuccess: "Program uploaded, translated, and published.",
    deleteSuccess: "Program deleted.",
    badge: "Program Upload",
    title: "Upload PDF Program",
    subtitle: "Price is set automatically: Diet = 350 TRY, Program = 400 TRY. Upload triggers translation into EN/TR/AR/ES/FR.",
    coachLimitLabel: "Coach limit",
    titlePlaceholder: "Program title",
    programOption: "Program (400 TRY)",
    dietOption: "Diet (350 TRY)",
    uploading: "Uploading and translating...",
    upload: "Upload program",
    activeUploads: "Your active uploads",
    noUploads: "No uploaded programs yet.",
    dietLabel: "Diet",
    programLabel: "Program",
    delete: "Delete",
    uploadCtaTitle: "Upload Program",
    noProgramsPublished: "No programs are published yet. Check back soon.",
    uploadedProgramPreview: "Uploaded Program",
    uploadedPdfAsset: "Uploaded PDF",
    translatedPackAsset: "Translated Pack"
  },
  tr: {
    onlyAdminsAndCoaches: "Sadece admin ve koç hesaplari program yukleyebilir.",
    titleAndPdfRequired: "Baslik ve PDF zorunludur.",
    coachLimitReached: "Koç yukleme limiti doldu (en fazla 3 aktif program). Once birini sil.",
    uploadFailed: "Yukleme basarisiz.",
    deleteFailed: "Program silinemedi.",
    uploadSuccess: "Program yuklendi, cevrildi ve yayinlandi.",
    deleteSuccess: "Program silindi.",
    badge: "Program Yukleme",
    title: "PDF Program Yukle",
    subtitle: "Fiyat otomatik belirlenir: Diyet = 350 TRY, Program = 400 TRY. Yukleme EN/TR/AR/ES/FR cevirisini baslatir.",
    coachLimitLabel: "Koç limiti",
    titlePlaceholder: "Program basligi",
    programOption: "Program (400 TRY)",
    dietOption: "Diyet (350 TRY)",
    uploading: "Yukleniyor ve cevriliyor...",
    upload: "Program yukle",
    activeUploads: "Aktif yuklemelerin",
    noUploads: "Henuz yuklenmis program yok.",
    dietLabel: "Diyet",
    programLabel: "Program",
    delete: "Sil",
    uploadCtaTitle: "Program Yukle",
    noProgramsPublished: "Henuz yayinlanmis program yok. Yakinda tekrar kontrol et.",
    uploadedProgramPreview: "Yuklenen Program",
    uploadedPdfAsset: "Yuklenen PDF",
    translatedPackAsset: "Cevrilmis Paket"
  },
  ar: {
    onlyAdminsAndCoaches: "فقط حسابات الادمن والمدرب يمكنها رفع البرامج.",
    titleAndPdfRequired: "العنوان وملف PDF مطلوبان.",
    coachLimitReached: "تم الوصول الى حد رفع المدرب (3 برامج نشطة كحد اقصى). احذف واحدا اولا.",
    uploadFailed: "فشل الرفع.",
    deleteFailed: "تعذر حذف البرنامج.",
    uploadSuccess: "تم رفع البرنامج وترجمته ونشره.",
    deleteSuccess: "تم حذف البرنامج.",
    badge: "رفع البرامج",
    title: "رفع برنامج PDF",
    subtitle: "يتم تحديد السعر تلقائيا: النظام الغذائي = 350 TRY، البرنامج = 400 TRY. الرفع يطلق الترجمة الى EN/TR/AR/ES/FR.",
    coachLimitLabel: "حد المدرب",
    titlePlaceholder: "عنوان البرنامج",
    programOption: "برنامج (400 TRY)",
    dietOption: "نظام غذائي (350 TRY)",
    uploading: "جار الرفع والترجمة...",
    upload: "رفع البرنامج",
    activeUploads: "الملفات النشطة",
    noUploads: "لا توجد برامج مرفوعة بعد.",
    dietLabel: "نظام غذائي",
    programLabel: "برنامج",
    delete: "حذف",
    uploadCtaTitle: "رفع برنامج",
    noProgramsPublished: "لا توجد برامج منشورة بعد. عد لاحقا.",
    uploadedProgramPreview: "برنامج مرفوع",
    uploadedPdfAsset: "PDF مرفوع",
    translatedPackAsset: "حزمة مترجمة"
  },
  es: {
    onlyAdminsAndCoaches: "Solo cuentas admin y coach pueden subir programas.",
    titleAndPdfRequired: "El titulo y el PDF son obligatorios.",
    coachLimitReached: "Se alcanzo el limite del coach (maximo 3 programas activos). Elimina uno primero.",
    uploadFailed: "La subida fallo.",
    deleteFailed: "No se pudo eliminar el programa.",
    uploadSuccess: "Programa subido, traducido y publicado.",
    deleteSuccess: "Programa eliminado.",
    badge: "Subida de Programas",
    title: "Subir Programa PDF",
    subtitle: "El precio se fija automaticamente: Dieta = 350 TRY, Programa = 400 TRY. La subida activa la traduccion EN/TR/AR/ES/FR.",
    coachLimitLabel: "Limite del coach",
    titlePlaceholder: "Titulo del programa",
    programOption: "Programa (400 TRY)",
    dietOption: "Dieta (350 TRY)",
    uploading: "Subiendo y traduciendo...",
    upload: "Subir programa",
    activeUploads: "Tus subidas activas",
    noUploads: "Aun no hay programas subidos.",
    dietLabel: "Dieta",
    programLabel: "Programa",
    delete: "Eliminar",
    uploadCtaTitle: "Subir Programa",
    noProgramsPublished: "Aun no hay programas publicados. Vuelve pronto.",
    uploadedProgramPreview: "Programa Subido",
    uploadedPdfAsset: "PDF Subido",
    translatedPackAsset: "Paquete Traducido"
  },
  fr: {
    onlyAdminsAndCoaches: "Seuls les comptes admin et coach peuvent televerser des programmes.",
    titleAndPdfRequired: "Le titre et le PDF sont obligatoires.",
    coachLimitReached: "La limite du coach est atteinte (3 programmes actifs max). Supprimez-en un d'abord.",
    uploadFailed: "Le televersement a echoue.",
    deleteFailed: "Impossible de supprimer le programme.",
    uploadSuccess: "Programme televerse, traduit et publie.",
    deleteSuccess: "Programme supprime.",
    badge: "Televersement de Programmes",
    title: "Televerser un Programme PDF",
    subtitle: "Le prix est fixe automatiquement : Diete = 350 TRY, Programme = 400 TRY. Le televersement lance la traduction EN/TR/AR/ES/FR.",
    coachLimitLabel: "Limite coach",
    titlePlaceholder: "Titre du programme",
    programOption: "Programme (400 TRY)",
    dietOption: "Diete (350 TRY)",
    uploading: "Televersement et traduction...",
    upload: "Televerser le programme",
    activeUploads: "Vos televersements actifs",
    noUploads: "Aucun programme televerse pour le moment.",
    dietLabel: "Diete",
    programLabel: "Programme",
    delete: "Supprimer",
    uploadCtaTitle: "Televerser un Programme",
    noProgramsPublished: "Aucun programme publie pour le moment. Revenez bientot.",
    uploadedProgramPreview: "Programme Televerse",
    uploadedPdfAsset: "PDF Televerse",
    translatedPackAsset: "Pack Traduit"
  }
};

export function getProgramManagementCopy(locale: Locale) {
  return copy[locale];
}
