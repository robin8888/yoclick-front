import { useState } from 'react';
import { View } from 'react-native';

import type { RoutineDetailResponseDtoAssignmentsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { emptyTargetOfKind, type AssignmentTargetDraft } from '../model/routine-draft';
import { AssignTargetField } from './AssignTargetField';
import { createCardStyle, GROW_STYLE, ROW_STYLE, SECTION_STYLE } from './RoutinesCommon.styles';

type Assignment = RoutineDetailResponseDtoAssignmentsItem;
type ChosenTarget = Exclude<AssignmentTargetDraft, { kind: 'none' }>;

function describeTarget(assignment: Assignment): string {
  return assignment.kind === 'group'
    ? i18n.t('routines.detail.groupAssignment', { name: assignment.targetName })
    : assignment.targetName;
}

function AssignmentRow({
  assignment,
  onRemove,
}: Readonly<{ assignment: Assignment; onRemove: () => void }>): React.JSX.Element {
  const label = describeTarget(assignment);

  return (
    <View style={ROW_STYLE}>
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{label}</Text>
      </View>
      <IconButton
        iconName="close"
        variant="tonal"
        accessibilityLabel={i18n.t('routines.detail.removeAssignmentLabel', { name: label })}
        onPress={onRemove}
      />
    </View>
  );
}

function isChosen(target: AssignmentTargetDraft): target is ChosenTarget {
  if (target.kind === 'client') return target.membershipId !== '';
  return target.kind === 'group' && target.groupId !== '';
}

/** Elegir otra persona o grupo y confirmarlo; al asignar, quien la recibe lo sabe por un aviso push. */
function AssignMoreControl({
  isBusy,
  onAssign,
}: Readonly<{
  isBusy: boolean;
  onAssign: (target: ChosenTarget, onDone: () => void) => void;
}>): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<AssignmentTargetDraft>(emptyTargetOfKind('client'));

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        leadingIconName="plus"
        label={i18n.t('routines.detail.assignMoreAction')}
        onPress={() => {
          setIsOpen(true);
        }}
      />
    );
  }
  return (
    <View style={SECTION_STYLE}>
      <AssignTargetField target={target} onTargetChange={setTarget} />
      <Button
        label={i18n.t('routines.builder.saveAndAssignAction')}
        isFullWidth
        isLoading={isBusy}
        isDisabled={!isChosen(target)}
        onPress={() => {
          if (!isChosen(target)) return;
          onAssign(target, () => {
            setIsOpen(false);
            setTarget(emptyTargetOfKind('client'));
          });
        }}
      />
    </View>
  );
}

interface RoutineAssignmentsSectionProps {
  assignments: readonly Assignment[];
  isBusy: boolean;
  onAssign: (target: ChosenTarget, onDone: () => void) => void;
  onUnassign: (assignmentId: string) => void;
}

/** A quién está asignada la rutina: se quita con la cruz y se añade a otra persona o grupo. */
export function RoutineAssignmentsSection({
  assignments,
  isBusy,
  onAssign,
  onUnassign,
}: Readonly<RoutineAssignmentsSectionProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('routines.detail.assignmentsTitle')}
      </Text>
      <View style={createCardStyle(theme)}>
        {assignments.length === 0 ? (
          <Text color="ink2">{i18n.t('routines.detail.noAssignments')}</Text>
        ) : (
          assignments.map((assignment) => (
            <AssignmentRow
              key={assignment.id}
              assignment={assignment}
              onRemove={() => {
                onUnassign(assignment.id);
              }}
            />
          ))
        )}
      </View>
      <AssignMoreControl isBusy={isBusy} onAssign={onAssign} />
    </View>
  );
}
