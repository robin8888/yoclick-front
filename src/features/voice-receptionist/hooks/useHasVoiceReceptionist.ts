import { isVoiceReceptionistAvailable } from '../model/voice-service-state';
import { useVoiceOverview } from './useVoiceOverview';

/**
 * ¿Sale el acceso del Contestador IA en el inicio del centro? Solo si el servicio está contratado:
 * mientras carga, si falla o si no lo tiene, el inicio queda como siempre.
 */
export function useHasVoiceReceptionist(): boolean {
  const overview = useVoiceOverview();
  return overview.isSuccess && isVoiceReceptionistAvailable(overview.data);
}
