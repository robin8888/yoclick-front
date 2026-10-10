import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { useAssignContent } from '../hooks/useContentMutations';
import { useAssignmentDraft } from '../hooks/useAssignmentDraft';
import { useContentVocabulary } from '../hooks/useContentVocabulary';
import { buildAssignmentTargets } from '../model/assignment-draft';
import { AssignClientsField } from './AssignClientsField';
import { EveryoneChip, GroupChips, LevelChips } from './AssignTargetChips';

interface AssignContentFormProps {
  content: ContentResponseDto;
  onDone: () => void;
}

interface AssignTargetFieldsProps {
  marked: ReturnType<typeof useAssignmentDraft>;
  vocabulary: ReturnType<typeof useContentVocabulary>;
}

/** Los cuatro destinos: todos, nivel, grupo y persona. */
function AssignTargetFields({
  marked,
  vocabulary,
}: Readonly<AssignTargetFieldsProps>): React.JSX.Element {
  return (
    <>
      <EveryoneChip
        draft={marked.draft}
        clientWord={vocabulary.clientWordPlural}
        onEveryoneToggle={marked.onEveryoneToggle}
      />
      <LevelChips
        draft={marked.draft}
        levelWords={vocabulary.levelWords}
        onLevelToggle={marked.onLevelToggle}
      />
      <GroupChips draft={marked.draft} onGroupToggle={marked.onGroupToggle} />
      <AssignClientsField
        draft={marked.draft}
        clientWord={vocabulary.clientWord}
        onClientAdd={marked.onClientAdd}
        onClientRemove={marked.onClientRemove}
      />
    </>
  );
}

function AssignContentForm({
  content,
  onDone,
}: Readonly<AssignContentFormProps>): React.JSX.Element {
  const vocabulary = useContentVocabulary();
  const assignment = useAssignContent();
  const marked = useAssignmentDraft(content.assignments);

  return (
    <>
      <Text variant="bodyStrong" numberOfLines={2}>
        {i18n.t('content.assign.pieceLabel', { title: content.title })}
      </Text>
      <AssignTargetFields marked={marked} vocabulary={vocabulary} />
      {assignment.errorMessage === null ? null : (
        <FormErrorBanner message={assignment.errorMessage} />
      )}
      <Button
        label={i18n.t('content.assign.confirmAction')}
        isFullWidth
        isLoading={assignment.isRunning}
        onPress={() => {
          const targets = buildAssignmentTargets(marked.draft);
          assignment.run({ contentId: content.id, targets }, onDone);
        }}
      />
    </>
  );
}

interface AssignContentSheetProps {
  /** La pieza que se va a asignar; `null` con la hoja cerrada. */
  content: ContentResponseDto | null;
  onDismiss: () => void;
}

/** «Asignar contenido»: por nivel, por grupo o por persona. Lo que se marca sustituye a lo anterior. */
export function AssignContentSheet({
  content,
  onDismiss,
}: Readonly<AssignContentSheetProps>): React.JSX.Element {
  return (
    <BottomSheet
      isVisible={content !== null}
      title={i18n.t('content.assign.title')}
      onDismiss={onDismiss}
    >
      {content === null ? null : (
        <AssignContentForm key={content.id} content={content} onDone={onDismiss} />
      )}
    </BottomSheet>
  );
}
