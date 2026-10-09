export const CONTENT_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type ContentLevel = (typeof CONTENT_LEVELS)[number];

/** El texto del nivel según el vocabulario del sector («Inicio», «Base», «Avanzado»). */
export function describeContentLevel(level: ContentLevel, levelWords: readonly string[]): string {
  return levelWords[CONTENT_LEVELS.indexOf(level)] ?? level;
}
