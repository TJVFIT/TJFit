import { normalizeQuizAnswers,buildTjaiUserProfile } from '@/lib/tjai-intake';
import type { QuizAnswers } from '@/lib/tjai-types';
import type { Locale } from '@/lib/i18n';
import {calculateTJAIMetrics} from '@/lib/tjai-science';
import {preflightNutrition} from './macro-balance';

export function validateAdultIntake(value: unknown, locale: unknown): { ok: true; answers: QuizAnswers; age: number; locale: Locale } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid_intake' };
  const raw = value as Record<string, unknown>;
  const age = Number(raw.s1_age), weight = Number(raw.s1_weight), height = Number(raw.s1_height);
  if (!Number.isInteger(age) || age < 18 || age > 100) return { ok: false, error: 'adults_only' };
  if (!Number.isFinite(weight) || weight < 30 || weight > 300 || !Number.isFinite(height) || height < 120 || height > 250) return { ok: false, error: 'invalid_measurements' };
  if (JSON.stringify(raw).length > 18000) return { ok: false, error: 'intake_too_large' };
  const language = ['en','tr','ar','es','fr'].includes(String(locale)) ? locale as Locale : 'en';
  const answers=normalizeQuizAnswers({ ...raw, locale: language });
  const profile=buildTjaiUserProfile(answers);
  if(!Number.isInteger(profile.trainingDays)||profile.trainingDays<2||profile.trainingDays>6||profile.sessionMinutes<15||profile.sessionMinutes>120)return {ok:false,error:'invalid_schedule'};
  // The v1 template cannot safely interpret clinical requirements or arbitrary food exclusions.
  // Reject unsupported scope before checkout instead of inventing a tailored medical plan.
  if(profile.injuries.some(i=>i==='recent_surgery'||i==='chronic_condition')||profile.injuryNotes||profile.restrictionNotes)return {ok:false,error:'general_fitness_scope'};
  if(weight/((height/100)**2)<18.5 || (profile.targetWeightKg&&profile.targetWeightKg/((height/100)**2)<18.5))return {ok:false,error:'general_fitness_scope'};
  if(!preflightNutrition(profile,calculateTJAIMetrics(answers)))return {ok:false,error:'nutrition_targets_unsupported'};
  return { ok: true, answers, age, locale: language };
}

export function turkeyPeriod(date = new Date(), month = false): string {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  return month ? day.slice(0, 7) : day;
}
