export type ExperienceDuration =
  'lessThanSixMonths' | 'sixToTwelveMonths' | 'oneToTwoYears' | 'moreThanTwoYears';

export const EXPERIENCE_DURATIONS: readonly ExperienceDuration[] = [
  'lessThanSixMonths',
  'sixToTwelveMonths',
  'oneToTwoYears',
  'moreThanTwoYears',
];

/** Posición dentro de los tres niveles del sector (`levels`): Inicio, Base, Avanzado… */
export const STARTING_LEVEL_INDEX = { first: 0, middle: 1, last: 2 } as const;

export type StartingLevelIndex = (typeof STARTING_LEVEL_INDEX)[keyof typeof STARTING_LEVEL_INDEX];

export function estimateStartingLevelIndex(experience: ExperienceDuration): StartingLevelIndex {
  if (experience === 'lessThanSixMonths') return STARTING_LEVEL_INDEX.first;
  if (experience === 'moreThanTwoYears') return STARTING_LEVEL_INDEX.last;
  return STARTING_LEVEL_INDEX.middle;
}
