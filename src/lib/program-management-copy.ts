import type { Locale } from "@/lib/i18n";

const copy = {
  badge: "Coach tools",
  title: "Upload a custom program",
  subtitle: "Publish a PDF program and make it available in TJFit’s supported languages.",
  coachLimitLabel: "Active upload limit",
  coachLimitReached: "Your active upload limit has been reached.",
  onlyAdminsAndCoaches: "Only approved coaches and admins can upload programs.",
  titlePlaceholder: "Program title",
  programOption: "Training program",
  dietOption: "Nutrition program",
  titleAndPdfRequired: "Add a title and PDF file.",
  upload: "Upload program",
  uploadCtaTitle: "Upload a coach program",
  uploading: "Uploading...",
  uploadFailed: "The program could not be uploaded.",
  uploadSuccess: "Program uploaded.",
  activeUploads: "Active uploads",
  noUploads: "No custom programs yet.",
  noProgramsPublished: "No programs have been published yet.",
  programLabel: "Training",
  dietLabel: "Nutrition",
  delete: "Delete",
  deleteFailed: "The program could not be deleted.",
  deleteSuccess: "Program deleted.",
  uploadedProgramPreview: "Uploaded program preview",
  uploadedPdfAsset: "Original program PDF",
  translatedPackAsset: "Translated program content"
};

export function getProgramManagementCopy(locale: Locale) {
  void locale;
  return copy;
}
