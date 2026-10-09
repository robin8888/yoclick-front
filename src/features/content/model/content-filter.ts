import type { ContentLevel } from './content-levels';

export interface ContentFilter {
  /** `null` = «Todos». */
  level: ContentLevel | null;
  /** `null` = «Todas». */
  need: string | null;
}

export const NO_CONTENT_FILTER: ContentFilter = { level: null, need: null };

interface FilterableContent {
  level: ContentLevel | null;
  need: string | null;
}

/** Lo que coincide con el nivel y la necesidad elegidos; un filtro vacío deja pasar todo. */
export function filterContent<TContent extends FilterableContent>(
  contents: readonly TContent[],
  filter: ContentFilter,
): TContent[] {
  return contents.filter(
    (content) =>
      (filter.level === null || content.level === filter.level) &&
      (filter.need === null || content.need === filter.need),
  );
}
