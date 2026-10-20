import { useActiveCenterModules, useActiveCenterSectorId } from '@/features/join';
import { hasRoomManagement } from '@/shared/i18n';

import { buildSetupGuideGroups } from '../model/setup-guide-steps';
import { summarizeSetupProgress, type SetupProgress } from '../model/setup-progress';
import { useCenterSettings } from './useCenterSettings';
import { useJoinStats } from './useJoinStats';
import { useRoomList } from './useRoomList';
import { useServiceCatalog } from './useServiceCatalog';
import { useTeamRoster } from './useTeamRoster';

/** Cuánto lleva hecho el centro de «Primeros pasos»; `undefined` mientras no se sepa todo. */
export function useSetupProgress(): SetupProgress | undefined {
  const settings = useCenterSettings().data;
  const services = useServiceCatalog().data;
  const rooms = useRoomList().data;
  const team = useTeamRoster().data;
  const joinStats = useJoinStats().data;
  const modules = useActiveCenterModules();
  const canManageSpaces = hasRoomManagement(useActiveCenterSectorId());

  if (!settings || !services || !rooms || !team || !joinStats) return undefined;

  return summarizeSetupProgress(buildSetupGuideGroups({ canManageSpaces, modules }), {
    hasCenterDetails: settings.address !== null && settings.phone !== null,
    hasOpeningHours: settings.openingHours !== null,
    hasServices: services.services.length > 0,
    hasRooms: rooms.rooms.length > 0,
    hasTeam: team.members.length > 1,
    hasClients: joinStats.total > 0,
  });
}
