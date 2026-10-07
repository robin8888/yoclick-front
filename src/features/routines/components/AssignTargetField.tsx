import { View } from 'react-native';

import { ClientPicker } from '@/features/clients';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import { useGroupOptions } from '../hooks/useRoutineQueries';
import { emptyTargetOfKind, type AssignmentTargetDraft } from '../model/routine-draft';
import { createCardStyle, GROW_STYLE, ROW_STYLE } from './RoutinesCommon.styles';

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

function ChosenClient({
  name,
  onChange,
}: Readonly<{ name: string; onChange: () => void }>): React.JSX.Element {
  return (
    <View style={ROW_STYLE}>
      <Avatar name={name} isDecorative />
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{name}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('routines.builder.chosenClientHint')}
        </Text>
      </View>
      <Button
        size="sm"
        variant="ghost"
        label={i18n.t('routines.builder.changeTargetAction')}
        accessibilityLabel={i18n.t('routines.builder.changeTargetLabel', { name })}
        onPress={onChange}
      />
    </View>
  );
}

function TargetChoices({
  target,
  onTargetChange,
}: Readonly<AssignTargetFieldProps>): React.JSX.Element {
  if (target.kind === 'client' && target.membershipId !== '') {
    return (
      <ChosenClient
        name={target.name}
        onChange={() => {
          onTargetChange(emptyTargetOfKind('client'));
        }}
      />
    );
  }
  if (target.kind === 'client') {
    return (
      <ClientPicker
        onClientSelect={(client) => {
          onTargetChange({
            kind: 'client',
            membershipId: client.membershipId,
            name: client.fullName,
          });
        }}
      />
    );
  }
  if (target.kind === 'group') {
    return (
      <GroupOptions
        selectedGroupId={target.groupId === '' ? null : target.groupId}
        onGroupSelect={(group) => {
          onTargetChange({ kind: 'group', groupId: group.id, name: group.name });
        }}
      />
    );
  }
  return <Text color="ink2">{i18n.t('routines.builder.assignNoneHint')}</Text>;
}

/** «Asignar a»: a nadie todavía, a una persona (buscándola) o a un grupo; quien la recibe lo sabe por un aviso. */
export function AssignTargetField({
  target,
  onTargetChange,
}: Readonly<AssignTargetFieldProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCardStyle(theme)}>
      <View>
        <Text variant="titleMd" role="heading">
          {i18n.t('routines.builder.assignTitle')}
        </Text>
        <Text variant="caption" color="ink2">
          {i18n.t('routines.builder.assignHint')}
        </Text>
      </View>
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
