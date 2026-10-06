import { useQuery } from '@tanstack/react-query';

import { getTeamListQueryOptions } from '@/shared/api/generated/endpoints/team/team';

import { selectAssignableStaff, type AssignableStaffMember } from '../model/service-staff';
import { useActiveCenterId } from './useActiveCenterId';

interface AssignableStaff {
  members: AssignableStaffMember[];
  isLoading: boolean;
  hasFailed: boolean;
  retry: () => void;
}

/** El equipo al que se puede asignar un servicio; solo lo ve quien administra el centro. */
export function useAssignableStaff(): AssignableStaff {
  const team = useQuery(getTeamListQueryOptions(useActiveCenterId()));

  return {
    members: selectAssignableStaff(team.data?.members ?? []),
    isLoading: team.isPending,
    hasFailed: team.isError,
    retry: () => void team.refetch(),
  };
}
