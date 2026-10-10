import { normalizeHexColor } from '@/shared/theme/brand-engine';
import type { CenterSettingsResponseDto } from '@/shared/api/generated/model';
import type { CenterAppearance } from '@/shared/theme';

export const MIN_CENTER_NAME_LENGTH = 2;
export const MAX_CENTER_NAME_LENGTH = 80;

export interface BrandDraft {
  name: string;
  /** `#RRGGBB`; mientras se escribe a mano puede estar incompleto. */
  color: string;
  /** Fondo y colmena Premium; cada color es `null` (el del tema) o un `#RRGGBB` a medio escribir. */
  appearance: CenterAppearance;
}

export type BrandDraftProblem =
  'name-too-short' | 'name-too-long' | 'color-invalid' | 'appearance-color-invalid';

export interface BrandPatch {
  name?: string;
  brandColor?: string;
  backgroundColor?: string | null;
  backgroundColorEnd?: string | null;
  hiveColor?: string | null;
}

const APPEARANCE_PATCH_KEYS = ['backgroundColor', 'backgroundColorEnd', 'hiveColor'] as const;

function isAppearanceColorValid(color: string | null): boolean {
  return color === null || normalizeHexColor(color) !== null;
}

export function findBrandDraftProblems(draft: BrandDraft): BrandDraftProblem[] {
  const trimmedNameLength = draft.name.trim().length;
  const problems: BrandDraftProblem[] = [];
  if (trimmedNameLength < MIN_CENTER_NAME_LENGTH) problems.push('name-too-short');
  if (trimmedNameLength > MAX_CENTER_NAME_LENGTH) problems.push('name-too-long');
  if (normalizeHexColor(draft.color) === null) problems.push('color-invalid');
  if (!APPEARANCE_PATCH_KEYS.every((key) => isAppearanceColorValid(draft.appearance[key]))) {
    problems.push('appearance-color-invalid');
  }
  return problems;
}

function normalizeOptionalColor(color: string | null): string | null {
  return color === null ? null : normalizeHexColor(color);
}

function buildAppearancePatch(draft: CenterAppearance, published: CenterAppearance): BrandPatch {
  const patch: BrandPatch = {};
  for (const key of APPEARANCE_PATCH_KEYS) {
    const draftColor = normalizeOptionalColor(draft[key]);
    if (draftColor !== normalizeOptionalColor(published[key])) patch[key] = draftColor;
  }
  // Un degradado sin su primer color no existe: quitar el fondo quita también el segundo color.
  if (patch.backgroundColor === null && published.backgroundColorEnd !== null) {
    patch.backgroundColorEnd = null;
  }
  return patch;
}

/** Solo lo que cambia respecto a lo publicado; `null` si no hay nada que publicar. */
export function buildBrandPatch(draft: BrandDraft, published: BrandDraft): BrandPatch | null {
  const patch: BrandPatch = buildAppearancePatch(draft.appearance, published.appearance);
  const draftName = draft.name.trim();
  const draftColor = normalizeHexColor(draft.color);
  if (draftName !== published.name) patch.name = draftName;
  if (draftColor !== null && draftColor !== normalizeHexColor(published.color)) {
    patch.brandColor = draftColor;
  }
  return Object.keys(patch).length === 0 ? null : patch;
}

/** Lo publicado del centro, con el formato del borrador. */
export function mapSettingsToBrandDraft(
  settings: Pick<
    CenterSettingsResponseDto,
    'name' | 'brandColor' | 'backgroundColor' | 'backgroundColorEnd' | 'hiveColor'
  >,
): BrandDraft {
  return {
    name: settings.name,
    color: settings.brandColor,
    appearance: {
      backgroundColor: settings.backgroundColor,
      backgroundColorEnd: settings.backgroundColorEnd,
      hiveColor: settings.hiveColor,
    },
  };
}
