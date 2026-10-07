import { View } from 'react-native';

import { ClientPicker } from '@/features/clients';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import { useGroupOptions } from '../hooks/useRoutineQueries';
import { emptyTargetOfKind, type AssignmentTargetDraft } from '../model/routine-draft';
import { SECTION_STYLE } from './RoutinesCommon.styles';

type TargetKind = AssignmentTargetDraft['kind'];

interface AssignTargetFieldProps {
  target: AssignmentTargetDraft;
  onTargetChange: (target: AssignmentTargetDraft) => void;
}

function GroupOptions({
  selectedGroupId,
  onGroupSelect,
}: Readonly<{
  selectedGroupId: string | null;
  onGroupSelect: (group: { id: string; name: string }) => void;
}>): React.JSX.Element {
  const groups = useGroupOptions().data?.groups ?? [];
  if (groups.length === 0) {
    return <Text color="ink2">{i18n.t('routines.builder.groupsEmpty')}</Text>;
  }
  return (
    <>
      {groups.map((group) => (
        <OptionCard
          key={group.id}
          title={group.name}
          isSelected={group.id === selectedGroupId}
          onPress={() => {
            onGroupSelect(group);
          }}
        />
      ))}
    </>
  );
}

function TargetChoices({
  target,
  onTargetChange,
}: Readonly<AssignTargetFieldProps>): React.JSX.Element {
  return (
    <>
      {target.kind === 'client' && target.membershipId === '' ? (
        <ClientPicker
          onClientSelect={(client) => {
            onTargetChange({
              kind: 'client',
              membershipId: client.membershipId,
              name: client.fullName,
            });
          }}
        />
      ) : null}
      {target.kind === 'group' ? (
        <GroupOptions
          selectedGroupId={target.groupId === '' ? null : target.groupId}
          onGroupSelect={(group) => {
            onTargetChange({ kind: 'group', groupId: group.id, name: group.name });
          }}
        />
      ) : null}
      {target.kind === 'client' && target.membershipId !== '' ? (
        <Text variant="bodyStrong">
          {i18n.t('routines.builder.chosenTarget', { name: target.name })}
        </Text>
      ) : null}
    </>
  );
}

/** «Asignar a»: a nadie todavía, a una persona (buscándola) o a un grupo. */
export function AssignTargetField({
  target,
  onTargetChange,
}: Readonly<AssignTargetFieldProps>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('routines.builder.assignTitle')}
      </Text>
      <SegmentedControl<TargetKind>
        options={[
          { value: 'none', label: i18n.t('routines.builder.assignNone') },
          { value: 'client', label: i18n.t('routines.builder.assignClient') },
          { value: 'group', label: i18n.t('routines.builder.assignGroup') },
        ]}
        selectedValue={target.kind}
        onValueChange={(kind) => {
          onTargetChange(emptyTargetOfKind(kind));
        }}
      />
      <TargetChoices target={target} onTargetChange={onTargetChange} />
    </View>
  );
}
