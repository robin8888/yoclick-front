import { filterContent, NO_CONTENT_FILTER, type ContentFilter } from './content-filter';
import type { ContentLevel } from './content-levels';

interface SampleContent {
  id: string;
  level: ContentLevel | null;
  need: string | null;
}

const CONTENTS: readonly SampleContent[] = [
  { id: 'salute', level: 'beginner', need: 'Técnica' },
  { id: 'kata', level: 'intermediate', need: 'Katas' },
  { id: 'guide', level: 'beginner', need: 'Katas' },
  { id: 'untagged', level: null, need: null },
];

const FILTER_CASES: readonly [string, ContentFilter, string[]][] = [
  ['nothing', NO_CONTENT_FILTER, ['salute', 'kata', 'guide', 'untagged']],
  ['a level', { level: 'beginner', need: null }, ['salute', 'guide']],
  ['a need', { need: 'Katas', level: null }, ['kata', 'guide']],
  ['a level and a need', { level: 'beginner', need: 'Katas' }, ['guide']],
  ['a level nobody has', { level: 'advanced', need: null }, []],
];

describe('filterContent', () => {
  it.each(FILTER_CASES)('filtering by %s keeps %j', (_name, filter, expectedIds) => {
    expect(filterContent(CONTENTS, filter).map(({ id }) => id)).toEqual(expectedIds);
  });
});
