import { useRouter } from 'expo-router';
import { useState } from 'react';

import type {
  ClientResponseDto,
  GroupListResponseDtoGroupsItem,
} from '@/shared/api/generated/model';

import { buildClientChanges, type ClientEdits } from '../model/client-edits';
import { NO_CHOICE } from '../model/group-form';
import { useClient } from './useClient';
import { useUpdateClient } from './useClientMutations';
import { useGroupList } from './useGroupList';

interface ClientEditor {
  client: ClientResponseDto | undefined;
  groups: readonly GroupListResponseDtoGroupsItem[];
  levelChoice: string;
  groupChoice: string;
  hasChanges: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  chooseLevel: (level: string) => void;
  chooseGroup: (groupId: string) => void;
  save: () => void;
}

/** La ficha de un cliente en edición: lo guardado más el nivel y el grupo que se vayan eligiendo. */
export function useClientEditor(membershipId: string): ClientEditor {
  const router = useRouter();
  const client = useClient(membershipId).data;
  const groups = useGroupList().data?.groups ?? [];
  const [edits, setEdits] = useState<ClientEdits>({});
  const update = useUpdateClient(router.back);
  const changes = buildClientChanges(edits);

  return {
    client,
    groups,
    levelChoice: edits.level ?? client?.level ?? NO_CHOICE,
    groupChoice: edits.groupId ?? client?.group?.id ?? NO_CHOICE,
    hasChanges: Object.keys(changes).length > 0,
    isSaving: update.isRunning,
    errorMessage: update.errorMessage,
    chooseLevel: (level) => {
      setEdits((current) => ({ ...current, level }));
    },
    chooseGroup: (groupId) => {
      setEdits((current) => ({ ...current, groupId }));
    },
    save: () => {
      update.run({ membershipId, changes });
    },
  };
}
