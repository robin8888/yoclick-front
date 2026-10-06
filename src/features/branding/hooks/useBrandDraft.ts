import { useState } from 'react';

import { useCenterSettings } from '@/features/center-admin';

import {
  buildBrandPatch,
  findBrandDraftProblems,
  type BrandDraft,
  type BrandDraftProblem,
  type BrandPatch,
} from '../model/brand-draft';

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
}

/** El borrador de marca: lo publicado más lo que la persona va cambiando, sin copiar el servidor a estado. */
export function useBrandDraft(): BrandDraftState {
  const settings = useCenterSettings();
  const [edits, setEdits] = useState<Partial<BrandDraft>>({});
  const published: BrandDraft | null = settings.data
    ? { name: settings.data.name, color: settings.data.brandColor }
    : null;
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
    patch:
      draft === null || published === null || problems.length > 0
        ? null
        : buildBrandPatch(draft, published),
    changeName: (name) => {
      setEdits((current) => ({ ...current, name }));
    },
    changeColor: (color) => {
      setEdits((current) => ({ ...current, color }));
    },
  };
}
