import type { VoiceCallsResponseDtoDataItemOutcome } from '@/shared/api/generated/model';

type Outcome = NonNullable<VoiceCallsResponseDtoDataItemOutcome>;

export const VOICE_OUTCOME_LABEL_KEYS = {
  booking: 'voiceReceptionist.calls.outcomes.booking',
  cancellation: 'voiceReceptionist.calls.outcomes.cancellation',
  reschedule: 'voiceReceptionist.calls.outcomes.reschedule',
  transfer: 'voiceReceptionist.calls.outcomes.transfer',
  waitlist: 'voiceReceptionist.calls.outcomes.waitlist',
  no_action: 'voiceReceptionist.calls.outcomes.no_action',
} as const satisfies Record<Outcome, string>;

const SECONDS_PER_MINUTE = 60;
const SECONDS_DIGITS = 2;

/** «2 min 05 s»; sin duración (la llamada no se cerró bien) devuelve `null`. */
export function formatCallDuration(durationSeconds: number | null): string | null {
  if (durationSeconds === null) return null;
  const minutes = Math.floor(durationSeconds / SECONDS_PER_MINUTE);
  const seconds = durationSeconds % SECONDS_PER_MINUTE;
  return `${String(minutes)} min ${String(seconds).padStart(SECONDS_DIGITS, '0')} s`;
}
