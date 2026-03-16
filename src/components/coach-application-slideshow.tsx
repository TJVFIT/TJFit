"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

type BecomeCoachDict = Dictionary["becomeCoach"];

const STEPS = 7;

export function CoachApplicationSlideshow({
  dict,
  locale
}: {
  dict: BecomeCoachDict;
  locale: Locale;
}) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [languages, setLanguages] = useState("");
  const [country, setCountry] = useState("");
  const [certifications, setCertifications] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ageNum = parseInt(age, 10);
  const isAgeValid = !isNaN(ageNum) && ageNum >= 20;

  const canProceed = () => {
    if (step === 1) return isAgeValid;
    if (step === 2) return fullName.trim().length > 0;
    if (step === 3) return specialty.trim().length > 0;
    if (step === 4) return languages.trim().length > 0;
    if (step === 5) return country.trim().length > 0;
    if (step === 6) return certifications.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS && canProceed()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/coach-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: ageNum,
          full_name: fullName.trim(),
          specialty: specialty.trim(),
          languages: languages.trim(),
          country: country.trim(),
          certifications_and_style: certifications.trim(),
          locale
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[24px] border border-green-500/30 bg-green-500/10 p-6 text-center"
      >
        <p className="text-lg font-medium text-green-400">{dict.success}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i + 1 <= step ? "bg-accent" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-300">{dict.ageQuestion}</label>
            <input
              type="number"
              min={16}
              max={99}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input"
              placeholder="20"
            />
            {age && !isAgeValid && (
              <p className="text-sm text-red-400">{dict.ageError}</p>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-300">{dict.fullName}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder={dict.fullName}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-300">{dict.specialty}</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="input"
              placeholder={dict.specialtyPlaceholder}
            />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-300">{dict.languages}</label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              className="input"
              placeholder={dict.languagesPlaceholder}
            />
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-300">{dict.country}</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input"
              placeholder={dict.country}
            />
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-300">{dict.certifications}</label>
            <textarea
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              className="input min-h-32"
              placeholder={dict.certificationsPlaceholder}
            />
          </motion.div>
        )}

        {step === 7 && (
          <motion.div
            key="7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <p className="text-sm font-medium text-zinc-300">{dict.reviewTitle}</p>
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300 space-y-2">
              <p><span className="text-zinc-500">Age:</span> {age}</p>
              <p><span className="text-zinc-500">{dict.fullName}:</span> {fullName}</p>
              <p><span className="text-zinc-500">{dict.specialty}:</span> {specialty}</p>
              <p><span className="text-zinc-500">{dict.languages}:</span> {languages}</p>
              <p><span className="text-zinc-500">{dict.country}:</span> {country}</p>
              <p><span className="text-zinc-500">{dict.certifications}:</span> {certifications.slice(0, 80)}...</p>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
          >
            {dict.back}
          </button>
        )}
        <div className="flex-1" />
        {step < STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="gradient-button rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dict.next}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="gradient-button rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "..." : dict.submit}
          </button>
        )}
      </div>
    </div>
  );
}
