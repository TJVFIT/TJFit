import type { SupabaseClient } from "@supabase/supabase-js";

export type EmailSequenceEnrollment = {
  id: string;
  user_id: string;
  sequence_id: string;
  current_step: number;
  next_send_at: string | null;
  status: "active" | "completed" | "cancelled" | "failed";
};

type SequenceRow = {
  id: string;
  name: string;
  trigger_event: string;
};

type StepRow = {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_hours: number;
  template_key: string;
  subject_key: string;
};

export async function enrollUserInSequence(
  userId: string,
  triggerEvent: string,
  supabaseClient: SupabaseClient
) {
  const rpc = await supabaseClient.rpc("enroll_user_in_email_sequence", {
    p_user_id: userId,
    p_trigger_event: triggerEvent
  });

  if (!rpc.error) {
    return { ok: true as const, enrollmentId: (rpc.data as string | null) ?? null };
  }

  const { data: sequence, error: sequenceError } = await supabaseClient
    .from("email_sequences")
    .select("id,name,trigger_event")
    .eq("trigger_event", triggerEvent)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<SequenceRow>();

  if (sequenceError) return { ok: false as const, error: sequenceError.message };
  if (!sequence) return { ok: true as const, enrollmentId: null };

  const { data: existing, error: existingError } = await supabaseClient
    .from("email_sequence_enrollments")
    .select("id,status")
    .eq("user_id", userId)
    .eq("sequence_id", sequence.id)
    .eq("status", "active")
    .maybeSingle<{ id: string; status: string }>();

  if (existingError) return { ok: false as const, error: existingError.message };
  if (existing?.id) return { ok: true as const, enrollmentId: existing.id };

  const { data: firstStep, error: stepError } = await supabaseClient
    .from("email_sequence_steps")
    .select("delay_hours")
    .eq("sequence_id", sequence.id)
    .eq("is_active", true)
    .order("step_order", { ascending: true })
    .limit(1)
    .maybeSingle<{ delay_hours: number }>();

  if (stepError) return { ok: false as const, error: stepError.message };
  if (!firstStep) return { ok: true as const, enrollmentId: null };

  const nextSendAt = new Date(Date.now() + Number(firstStep.delay_hours) * 60 * 60 * 1000).toISOString();
  const { data: inserted, error: insertError } = await supabaseClient
    .from("email_sequence_enrollments")
    .insert({
      user_id: userId,
      sequence_id: sequence.id,
      current_step: 0,
      next_send_at: nextSendAt,
      status: "active"
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError) return { ok: false as const, error: insertError.message };
  return { ok: true as const, enrollmentId: inserted.id };
}

export async function cancelEnrollment(
  userId: string,
  sequenceName: string,
  supabaseClient: SupabaseClient
) {
  const { data: sequence, error: sequenceError } = await supabaseClient
    .from("email_sequences")
    .select("id")
    .eq("name", sequenceName)
    .maybeSingle<{ id: string }>();

  if (sequenceError) return { ok: false as const, error: sequenceError.message };
  if (!sequence) return { ok: true as const, cancelled: 0 };

  const { data, error } = await supabaseClient
    .from("email_sequence_enrollments")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("sequence_id", sequence.id)
    .eq("status", "active")
    .select("id");

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, cancelled: data?.length ?? 0 };
}

export async function advanceEnrollment(enrollmentId: string, supabaseClient: SupabaseClient) {
  const { data: enrollment, error: enrollmentError } = await supabaseClient
    .from("email_sequence_enrollments")
    .select("id,sequence_id,current_step,status")
    .eq("id", enrollmentId)
    .maybeSingle<EmailSequenceEnrollment>();

  if (enrollmentError) return { ok: false as const, error: enrollmentError.message };
  if (!enrollment || enrollment.status !== "active") return { ok: true as const, completed: false };

  const nextStepOrder = Number(enrollment.current_step ?? 0) + 2;
  const { data: nextStep, error: stepError } = await supabaseClient
    .from("email_sequence_steps")
    .select("id,sequence_id,step_order,delay_hours,template_key,subject_key")
    .eq("sequence_id", enrollment.sequence_id)
    .eq("step_order", nextStepOrder)
    .eq("is_active", true)
    .maybeSingle<StepRow>();

  if (stepError) return { ok: false as const, error: stepError.message };

  if (!nextStep) {
    const { error } = await supabaseClient
      .from("email_sequence_enrollments")
      .update({
        current_step: Number(enrollment.current_step ?? 0) + 1,
        next_send_at: null,
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", enrollmentId);

    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, completed: true };
  }

  const nextSendAt = new Date(Date.now() + Number(nextStep.delay_hours) * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseClient
    .from("email_sequence_enrollments")
    .update({
      current_step: Number(enrollment.current_step ?? 0) + 1,
      next_send_at: nextSendAt
    })
    .eq("id", enrollmentId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, completed: false };
}
