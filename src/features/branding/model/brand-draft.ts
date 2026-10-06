import { normalizeHexColor } from '@/shared/theme/brand-engine';

export const MIN_CENTER_NAME_LENGTH = 2;
export const MAX_CENTER_NAME_LENGTH = 80;

export interface BrandDraft {
  name: string;
  /** `#RRGGBB`; mientras se escribe a mano puede estar incompleto. */
  color: string;
}

export type BrandDraftProblem = 'name-too-short' | 'name-too-long' | 'color-invalid';

export interface BrandPatch {
  name?: string;
  brandColor?: string;
}

export function findBrandDraftProblems(draft: BrandDraft): BrandDraftProblem[] {
  const trimmedNameLength = draft.name.trim().length;
  const problems: BrandDraftProblem[] = [];
  if (trimmedNameLength < MIN_CENTER_NAME_LENGTH) problems.push('name-too-short');
  if (trimmedNameLength > MAX_CENTER_NAME_LENGTH) problems.push('name-too-long');
  if (normalizeHexColor(draft.color) === null) problems.push('color-invalid');
  return problems;
}

/** Solo lo que cambia respecto a lo publicado; `null` si no hay nada que publicar. */
export function buildBrandPatch(draft: BrandDraft, published: BrandDraft): BrandPatch | null {
  const patch: BrandPatch = {};
  const draftName = draft.name.trim();
  const draftColor = normalizeHexColor(draft.color);
  if (draftName !== published.name) patch.name = draftName;
  if (draftColor !== null && draftColor !== normalizeHexColor(published.color)) {
    patch.brandColor = draftColor;
  }
  return Object.keys(patch).length === 0 ? null : patch;
}
