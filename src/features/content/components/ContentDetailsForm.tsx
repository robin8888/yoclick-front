import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { FormField } from '@/ui/molecules/FormField';

import { useUpdateContent } from '../hooks/useContentMutations';
import { useContentDetailsDraft } from '../hooks/useContentDetailsDraft';
import { DetailsChoiceFields } from './DetailsChoiceFields';

const MAX_TITLE_LENGTH = 120;

interface ContentDetailsFormProps {
  content: ContentResponseDto;
  onSaved: () => void;
  onDeleteRequest: () => void;
}

/** Título, nivel y necesidad de una pieza: lo que usan los filtros de quien la ve. */
export function ContentDetailsForm({
  content,
  onSaved,
  onDeleteRequest,
}: Readonly<ContentDetailsFormProps>): React.JSX.Element {
  const update = useUpdateContent();
  const draft = useContentDetailsDraft(content);
  const title = draft.title.trim();

  return (
    <>
      <FormField
        label={i18n.t('content.details.titleLabel')}
        value={draft.title}
        maxLength={MAX_TITLE_LENGTH}
        onChangeText={draft.onTitleChange}
      />
      <DetailsChoiceFields draft={draft} />
      {update.errorMessage === null ? null : <FormErrorBanner message={update.errorMessage} />}
      <Button
        label={i18n.t('content.details.saveAction')}
        isFullWidth
        isDisabled={title === ''}
        isLoading={update.isRunning}
        onPress={() => {
          const changes = { title, level: draft.level, need: draft.need };
          update.run({ contentId: content.id, changes }, onSaved);
        }}
      />
      <Button
        variant="ghost"
        label={i18n.t('content.details.deleteAction')}
        isFullWidth
        onPress={onDeleteRequest}
      />
    </>
  );
}
