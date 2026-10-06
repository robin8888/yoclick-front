import type { BadgeTone } from '@/ui/atoms/Badge';

export const CLIENT_LEVEL_IDS = ['beginner', 'intermediate', 'advanced'] as const;
export type ClientLevelId = (typeof CLIENT_LEVEL_IDS)[number];

export const CLIENT_STATUS_FILTER_IDS = ['all', 'active', 'new', 'inactive', 'blocked'] as const;
export type ClientStatusFilterId = (typeof CLIENT_STATUS_FILTER_IDS)[number];

export type ClientBadgeId = 'active' | 'new' | 'inactive' | 'blocked';

interface ClientStateFacts {
  status: 'active' | 'blocked';
  activity: 'new' | 'active' | 'inactive';
}

export interface ClientBadge {
  id: ClientBadgeId;
  tone: BadgeTone;
}

/** El estado que se enseña junto al nombre, siempre con palabra: bloqueado manda sobre la actividad. */
export function resolveClientBadge({ status, activity }: ClientStateFacts): ClientBadge {
  if (status === 'blocked') return { id: 'blocked', tone: 'danger' };
  if (activity === 'new') return { id: 'new', tone: 'info' };
  return activity === 'active'
    ? { id: 'active', tone: 'success' }
    : { id: 'inactive', tone: 'neutral' };
}

/** El texto del nivel según el vocabulario del sector («Inicio», «Base», «Avanzado»). */
export function describeClientLevel(
  level: ClientLevelId | null,
  levelWords: readonly [string, string, string],
): string | null {
  if (level === null) return null;
  return levelWords[CLIENT_LEVEL_IDS.indexOf(level)] ?? null;
}

/** `undefined` deja de filtrar: «Todos». */
export function toStatusParam(
  filter: ClientStatusFilterId,
): Exclude<ClientStatusFilterId, 'all'> | undefined {
  return filter === 'all' ? undefined : filter;
}

export interface LevelChoice {
  value: string;
  label: string;
}

/** «Sin nivel» y los tres niveles con el vocabulario del sector, para elegir uno. */
export function buildLevelChoices(
  levelWords: readonly [string, string, string],
  noLevelLabel: string,
): LevelChoice[] {
  return [
    { value: '', label: noLevelLabel },
    ...CLIENT_LEVEL_IDS.map((levelId, index) => ({
      value: levelId,
      label: levelWords[index] ?? levelId,
    })),
  ];
}
