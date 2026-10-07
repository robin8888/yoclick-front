import { useState } from 'react';

import type { ProfileResponseDto } from '@/shared/api/generated/model';

import {
  buildSaveRequest,
  createDraftFromProfile,
  hasDraftChanges,
  type ProfileDraft,
} from '../model/profile-draft';
import { canSubmitProfile } from '../model/profile-status';
import { useSaveMyProfile, useSubmitMyProfile } from './useTeamProfileMutations';

export interface ProfileEditorState {
  draft: ProfileDraft;
  setDraft: (draft: ProfileDraft) => void;
  hasChanges: boolean;
  canSubmit: boolean;
  isRunning: boolean;
  errorMessage: string | null;
  save: () => void;
  submit: () => void;
}

/** Lo escrito en el formulario y lo que se puede hacer con ello: guardar, o guardar y enviar a revisión. */
export function useProfileEditorState(profile: ProfileResponseDto): ProfileEditorState {
  const [draft, setDraft] = useState(() => createDraftFromProfile(profile));
  const saveMutation = useSaveMyProfile();
  const submitMutation = useSubmitMyProfile();
  const hasChanges = hasDraftChanges(draft, profile);
  const isRunning = saveMutation.isRunning || submitMutation.isRunning;

  return {
    draft,
    setDraft,
    hasChanges,
    canSubmit: !isRunning && canSubmitProfile({ ...profile, ...buildSaveRequest(draft) }),
    isRunning,
    errorMessage: saveMutation.errorMessage ?? submitMutation.errorMessage,
    save: () => {
      saveMutation.run(buildSaveRequest(draft));
    },
    submit: () => {
      const sendToReview = (): void => {
        submitMutation.run();
      };
      if (hasChanges) saveMutation.run(buildSaveRequest(draft), sendToReview);
      else sendToReview();
    },
  };
}
