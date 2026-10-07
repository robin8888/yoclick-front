import type { ProfileResponseDto, SaveProfileRequestDto } from '@/shared/api/generated/model';

export const MAX_HEADLINE_LENGTH = 120;
export const MAX_BIO_LENGTH = 1000;
export const MAX_CHOSEN_ITEMS = 8;

export interface ProfileDraft {
  headline: string;
  bio: string;
  specialties: string[];
  languages: string[];
  hasPublishConsent: boolean;
}

export function createDraftFromProfile(profile: ProfileResponseDto): ProfileDraft {
  return {
    headline: profile.headline ?? '',
    bio: profile.bio ?? '',
    specialties: [...profile.specialties],
    languages: [...profile.languages],
    hasPublishConsent: profile.hasPublishConsent,
  };
}

/** Marca o desmarca un elemento de una lista de chips; no pasa del máximo del servidor. */
export function toggleChosenItem(chosen: readonly string[], item: string): string[] {
  if (chosen.includes(item)) return chosen.filter((existing) => existing !== item);
  return chosen.length >= MAX_CHOSEN_ITEMS ? [...chosen] : [...chosen, item];
}

export function buildSaveRequest(draft: ProfileDraft): SaveProfileRequestDto {
  return {
    headline: draft.headline.trim() === '' ? null : draft.headline.trim(),
    bio: draft.bio.trim() === '' ? null : draft.bio.trim(),
    specialties: draft.specialties,
    languages: draft.languages,
    hasPublishConsent: draft.hasPublishConsent,
  };
}

function sameItems(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length && first.every((item, index) => item === second[index]);
}

/** Si lo escrito se distingue de lo que ya hay guardado (sin contar espacios de más). */
export function hasDraftChanges(draft: ProfileDraft, saved: ProfileResponseDto): boolean {
  const request = buildSaveRequest(draft);
  return (
    request.headline !== saved.headline ||
    request.bio !== saved.bio ||
    request.hasPublishConsent !== saved.hasPublishConsent ||
    !sameItems(draft.specialties, saved.specialties) ||
    !sameItems(draft.languages, saved.languages)
  );
}
