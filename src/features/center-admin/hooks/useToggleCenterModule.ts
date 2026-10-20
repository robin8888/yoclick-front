import { useQueryClient } from '@tanstack/react-query';

import { getMeListMembershipsQueryKey } from '@/shared/api/generated/endpoints/me/me';

import type { CenterModuleEntry } from '../model/center-module-entries';
import { useSaveCenterSettings } from './useSaveCenterSettings';

interface ToggleCenterModule {
  toggleModule: (moduleId: CenterModuleEntry, isOn: boolean) => void;
  isSaving: boolean;
  saveErrorMessage: string | null;
}

/**
 * Enciende o apaga un módulo del centro. Además de guardar, refresca «mis centros»: de ahí lee la
 * app lo que esconde, y el cambio debe verse al momento.
 */
export function useToggleCenterModule(settingsVersion: string): ToggleCenterModule {
  const queryClient = useQueryClient();
  const { saveSettings, isSaving, saveErrorMessage } = useSaveCenterSettings(settingsVersion);

  return {
    toggleModule: (moduleId, isOn) => {
      saveSettings({ modules: { [moduleId]: isOn } }, () => {
        void queryClient.invalidateQueries({ queryKey: getMeListMembershipsQueryKey() });
      });
    },
    isSaving,
    saveErrorMessage,
  };
}
