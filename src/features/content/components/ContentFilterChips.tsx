import { i18n } from '@/shared/i18n';

import { useContentVocabulary } from '../hooks/useContentVocabulary';
import type { ContentFilter } from '../model/content-filter';
import { buildNeedFilterOptions } from '../model/content-filter-options';
import { SingleChoiceChips } from './SingleChoiceChips';

interface ContentFilterChipsProps {
  filter: ContentFilter;
  onFilterChange: (filter: ContentFilter) => void;
}

/** La fila de chips del cliente: la necesidad. El nivel no se elige: solo ve lo que le corresponde. */
export function ContentFilterChips({
  filter,
  onFilterChange,
}: Readonly<ContentFilterChipsProps>): React.JSX.Element {
  const vocabulary = useContentVocabulary();

  return (
    <SingleChoiceChips
      title={i18n.t('content.client.needsGroupLabel')}
      isTitleHidden
      options={buildNeedFilterOptions(vocabulary.needs)}
      selectedValue={filter.need}
      onSelect={(need) => {
        onFilterChange({ ...filter, need });
      }}
    />
  );
}
