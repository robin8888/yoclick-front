import type { VoiceOverviewResponseDto } from '@/shared/api/generated/model';

/**
 * En qué punto está el servicio en el centro:
 * - `not_contracted`: el centro no lo tiene (pantalla informativa, sin acceso en el inicio).
 * - `cancelled`: lo tuvo y ya no.
 * - `paused`: está contratado pero no atiende llamadas ahora mismo.
 * - `active` / `inactive`: contratado, con el interruptor encendido o apagado.
 */
export type VoiceServiceState = 'not_contracted' | 'cancelled' | 'paused' | 'active' | 'inactive';

export function resolveVoiceServiceState(overview: VoiceOverviewResponseDto): VoiceServiceState {
  if (overview.subscription === null) return 'not_contracted';
  if (overview.subscription.status === 'cancelled') return 'cancelled';
  if (overview.subscription.status === 'paused') return 'paused';
  return overview.isEnabled ? 'active' : 'inactive';
}

/** El acceso del inicio solo sale si el centro tiene el servicio contratado y no cancelado. */
export function isVoiceReceptionistAvailable(overview: VoiceOverviewResponseDto): boolean {
  const state = resolveVoiceServiceState(overview);
  return state !== 'not_contracted' && state !== 'cancelled';
}

/** El interruptor se puede usar si hay suscripción en marcha y un número asignado. */
export function canToggleVoiceReceptionist(overview: VoiceOverviewResponseDto): boolean {
  const state = resolveVoiceServiceState(overview);
  const isRunning = state === 'active' || state === 'inactive';
  return isRunning && overview.line !== null;
}
