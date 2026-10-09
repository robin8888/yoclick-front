import { i18n } from '@/shared/i18n';

import type { useContentDetailsDraft } from '../hooks/useContentDetailsDraft';
import { SingleChoiceChips } from './SingleChoiceChips';

/** El nivel y la necesidad de una pieza, para elegir uno de cada. */
export function DetailsChoiceFields({
  draft,
}: Readonly<{ draft: ReturnType<typeof useContentDetailsDraft> }>): React.JSX.Element {
  return (
    <>
      <SingleChoiceChips
        title={i18n.t('content.details.levelLabel')}
        options={draft.levelOptions}
        selectedValue={draft.level}
        onSelect={draft.onLevelSelect}
      />
      <SingleChoiceChips
        title={i18n.t('content.details.needLabel')}
        options={draft.needOptions}
        selectedValue={draft.need}
        onSelect={draft.onNeedSelect}
      />
    </>
  );
}
