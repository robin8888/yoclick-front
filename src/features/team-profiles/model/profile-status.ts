import type { ProfileResponseDto } from '@/shared/api/generated/model';
import type { BadgeTone } from '@/ui/atoms/Badge/Badge.types';

type ProfileStatus = ProfileResponseDto['status'];

export const PROFILE_STATUS_BADGES = {
  draft: { labelKey: 'teamProfiles.status.draft', tone: 'neutral' },
  pending: { labelKey: 'teamProfiles.status.pending', tone: 'warning' },
  published: { labelKey: 'teamProfiles.status.published', tone: 'success' },
  changes_requested: { labelKey: 'teamProfiles.status.changesRequested', tone: 'warning' },
} as const satisfies Record<ProfileStatus, { labelKey: string; tone: BadgeTone }>;

export const PROFILE_STATUS_TEXT_KEYS = {
  draft: 'teamProfiles.editor.statusDraft',
  pending: 'teamProfiles.editor.statusPending',
  published: 'teamProfiles.editor.statusPublished',
  changes_requested: 'teamProfiles.editor.statusChangesNoNote',
} as const satisfies Record<ProfileStatus, string>;

/** El perfil puede enviarse a revisión si hay algo que enseñar y se ha autorizado publicarlo. */
export function canSubmitProfile(
  profile: Pick<
    ProfileResponseDto,
    'headline' | 'bio' | 'introVideo' | 'hasPublishConsent' | 'status'
  >,
): boolean {
  const hasContent =
    profile.headline !== null || profile.bio !== null || profile.introVideo !== null;
  return hasContent && profile.hasPublishConsent && profile.status !== 'pending';
}
