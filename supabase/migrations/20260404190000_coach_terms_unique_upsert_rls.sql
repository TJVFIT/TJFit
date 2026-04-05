-- One acceptance row per coach (upsert on version bumps)
DELETE FROM public.coach_terms_acceptance c
WHERE c.id IN (
  SELECT id
  FROM (
      SELECT id,
        row_number() OVER (
          PARTITION BY coach_id
          ORDER BY accepted_at DESC, id DESC
        ) AS rn
      FROM public.coach_terms_acceptance
    ) t
  WHERE t.rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS coach_terms_acceptance_coach_id_key ON public.coach_terms_acceptance (coach_id);

DROP POLICY IF EXISTS "Coaches can update own terms acceptance" ON public.coach_terms_acceptance;
CREATE POLICY "Coaches can update own terms acceptance"
  ON public.coach_terms_acceptance
  FOR UPDATE
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);
