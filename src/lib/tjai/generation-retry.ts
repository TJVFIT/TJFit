/** Job IDs are server-issued, so retries retain their identity across tabs/reloads. */
export function createGenerationRetryController() {
  return {
    requestFor(intakeId: string, failedJobId?: string | null): string {
      // The initial request uses the intake UUID. Each newly observed failed
      // job supplies a distinct UUID for its retry; HTTP timing changes neither.
      return failedJobId ?? intakeId;
    }
  };
}

/** A return URL can show a result only when the owned job binds it to that intake. */
export function completedIntakePlan<T extends { id: string }>(intakeId: string | null, job: { intake_id: string; status: string; plan_id?: string | null } | null | undefined, plan: T | null | undefined): T | null {
  return intakeId && job?.intake_id === intakeId && job.status === 'succeeded' && plan && job.plan_id === plan.id ? plan : null;
}
