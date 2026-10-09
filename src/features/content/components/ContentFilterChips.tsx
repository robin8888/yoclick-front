import { i18n } from '@/shared/i18n';

import { useContentVocabulary } from '../hooks/useContentVocabulary';
import type { ContentFilter } from '../model/content-filter';
import { buildLevelFilterOptions, buildNeedFilterOptions } from '../model/content-filter-options';
import { SingleChoiceChips } from './SingleChoiceChips';

interface ContentFilterChipsProps {
  filter: ContentFilter;
  onFilterChange: (filter: ContentFilter) => void;
}

/** Las dos filas de chips del cliente: el nivel y la necesidad. */
export function ContentFilterChips({
  filter,
  onFilterChange,
}: Readonly<ContentFilterChipsProps>): React.JSX.Element {
  const vocabulary = useContentVocabulary();

  return (
    <>
      <SingleChoiceChips
        title={i18n.t('content.client.levelsGroupLabel')}
        isTitleHidden
        options={buildLevelFilterOptions(vocabulary.levelWords)}
        selectedValue={filter.level}
        onSelect={(level) => {
          onFilterChange({ ...filter, level });
        }}
      />
      <SingleChoiceChips
        title={i18n.t('content.client.needsGroupLabel')}
        isTitleHidden
        options={buildNeedFilterOptions(vocabulary.needs)}
        selectedValue={filter.need}
        onSelect={(need) => {
          onFilterChange({ ...filter, need });
        }}
      />
    </>
  );
}
