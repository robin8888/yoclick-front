import { useState } from 'react';

import { useCenterSettings } from '@/features/center-admin';
import { DEFAULT_CENTER_APPEARANCE, type CenterAppearance } from '@/shared/theme';

import {
  buildBrandPatch,
  mapSettingsToBrandDraft,
  findBrandDraftProblems,
  type BrandDraft,
  type BrandDraftProblem,
  type BrandPatch,
} from '../model/brand-draft';

function buildBrandPatchOrNull(
  draft: BrandDraft | null,
  published: BrandDraft | null,
): BrandPatch | null {
  if (draft === null || published === null) return null;
  return buildBrandPatch(draft, published);
}

export interface BrandDraftState {
  isLoading: boolean;
  hasFailed: boolean;
  error: unknown;
  retry: () => void;
  /** Lo que se ve ahora en la app de los clientes; `null` mientras carga. */
  published: BrandDraft | null;
  /** Valor de `ETag` de lo que se leyó: la publicación solo vale si nadie lo ha cambiado. */
  settingsVersion: string | null;
  draft: BrandDraft | null;
  problems: BrandDraftProblem[];
  /** Lo que cambia respecto a lo publicado; `null` si no hay cambios o el borrador no es válido. */
  patch: BrandPatch | null;
  changeName: (name: string) => void;
  changeColor: (color: string) => void;
  /** Cambia solo los colores indicados del fondo y la colmena Premium. */
  changeAppearance: (changes: Partial<CenterAppearance>) => void;
  /** Solo el plan Premium puede cambiar el fondo y la colmena. */
  canCustomizeAppearance: boolean;
}

interface BrandEdits {
  edits: Partial<BrandDraft>;
  changeName: (name: string) => void;
  changeColor: (color: string) => void;
  changeAppearance: (changes: Partial<CenterAppearance>) => void;
}

/** Lo que la persona ha tocado encima de lo publicado; el fondo y la colmena se mezclan color a color. */
function useBrandEdits(published: BrandDraft | null): BrandEdits {
  const [edits, setEdits] = useState<Partial<BrandDraft>>({});

  return {
    edits,
    changeName: (name) => {
      setEdits((current) => ({ ...current, name }));
    },
    changeColor: (color) => {
      setEdits((current) => ({ ...current, color }));
    },
    changeAppearance: (changes) => {
      setEdits((current) => ({
        ...current,
        appearance: {
          ...(current.appearance ?? published?.appearance ?? DEFAULT_CENTER_APPEARANCE),
          ...changes,
        },
      }));
    },
  };
}

/** El borrador de marca: lo publicado más lo que la persona va cambiando, sin copiar el servidor a estado. */
export function useBrandDraft(): BrandDraftState {
  const settings = useCenterSettings();
  const published = settings.data ? mapSettingsToBrandDraft(settings.data) : null;
  const { edits, ...changers } = useBrandEdits(published);
  const draft: BrandDraft | null = published === null ? null : { ...published, ...edits };
  const problems = draft === null ? [] : findBrandDraftProblems(draft);

  return {
    isLoading: settings.isPending,
    hasFailed: settings.isError,
    error: settings.error,
    retry: () => void settings.refetch(),
    published,
    settingsVersion: settings.data?.version ?? null,
    draft,
    problems,
    patch: problems.length > 0 ? null : buildBrandPatchOrNull(draft, published),
    ...changers,
    canCustomizeAppearance: settings.data?.canCustomizeAppearance ?? false,
  };
}
