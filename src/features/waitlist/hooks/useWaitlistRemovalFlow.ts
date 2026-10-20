import { useState } from 'react';

import type { SessionWaitlistResponseDtoEntriesItem } from '@/shared/api/generated/model';

import { useRemoveFromWaitlist } from './useRemoveFromWaitlist';

type WaitingPerson = SessionWaitlistResponseDtoEntriesItem;

interface WaitlistRemovalFlow {
  /** A quién se está pidiendo confirmar; `null` con la hoja cerrada. */
  personToRemove: WaitingPerson | null;
  askToRemove: (person: WaitingPerson) => void;
  confirmRemoval: () => void;
  dismissRemoval: () => void;
  isRemoving: boolean;
  errorMessage: string | null;
}

/** Quitar a alguien de la espera en dos pasos: elegirlo y confirmarlo en la hoja. */
export function useWaitlistRemovalFlow(classSessionId: string): WaitlistRemovalFlow {
  const removal = useRemoveFromWaitlist(classSessionId);
  const [personToRemove, setPersonToRemove] = useState<WaitingPerson | null>(null);

  return {
    personToRemove,
    askToRemove: setPersonToRemove,
    confirmRemoval: () => {
      if (personToRemove === null) return;
      removal.removeFromWaitlist(personToRemove.id, () => {
        setPersonToRemove(null);
      });
    },
    dismissRemoval: () => {
      setPersonToRemove(null);
    },
    isRemoving: removal.isRemoving,
    errorMessage: removal.errorMessage,
  };
}
