import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

import type { useServiceEditorForm } from '../hooks/useServiceEditorForm';
import { toggleStaffSelection } from '../model/service-staff';

type ServiceEditorForm = ReturnType<typeof useServiceEditorForm>;
type AssignableStaff = ServiceEditorForm['assignableStaff'];

const FIELD_STYLE = { gap: 8 } as const;

function StaffLoadStatus({
  isLoading,
  hasFailed,
  retry,
}: Readonly<Omit<AssignableStaff, 'members'>>): React.JSX.Element | null {
  if (isLoading) {
    return <Text color="ink2">{i18n.t('centerAdmin.serviceEditor.staffLoading')}</Text>;
  }
  if (!hasFailed) return null;
  return (
    <>
      <Text color="danger">{i18n.t('centerAdmin.serviceEditor.staffLoadError')}</Text>
      <Button variant="outline" size="sm" label={getSharedStateCopy().retryLabel} onPress={retry} />
    </>
  );
}

interface StaffMemberOptionsProps {
  members: AssignableStaff['members'];
  selectedMembershipIds: readonly string[];
  onSelectionChange: (nextMembershipIds: string[]) => void;
}

function StaffMemberOptions({
  members,
  selectedMembershipIds,
  onSelectionChange,
}: Readonly<StaffMemberOptionsProps>): React.JSX.Element {
  return (
    <>
      {members.map((member) => (
        <OptionCard
          key={member.membershipId}
          selectionMode="multiple"
          leading={<Avatar name={member.fullName} size="md" isDecorative />}
          title={member.fullName}
          meta={member.staffTitle ?? undefined}
          isSelected={selectedMembershipIds.includes(member.membershipId)}
          onPress={() => {
            onSelectionChange(toggleStaffSelection(selectedMembershipIds, member.membershipId));
          }}
        />
      ))}
    </>
  );
}

/** «Quién lo da»: el equipo activo con casillas; es entre quienes elegirá el cliente al reservar. */
export function ServiceStaffField({
  form,
}: Readonly<{ form: ServiceEditorForm }>): React.JSX.Element {
  const { members, isLoading, hasFailed, retry } = form.assignableStaff;

  return (
    <Controller
      control={form.control}
      name="staffMembershipIds"
      render={({ field, fieldState }) => (
        <View style={FIELD_STYLE}>
          <Text variant="bodyStrong">{i18n.t('centerAdmin.serviceEditor.staffLabel')}</Text>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.serviceEditor.staffHelper')}
          </Text>
          <StaffLoadStatus isLoading={isLoading} hasFailed={hasFailed} retry={retry} />
          <StaffMemberOptions
            members={members}
            selectedMembershipIds={field.value}
            onSelectionChange={field.onChange}
          />
          {fieldState.error === undefined ? null : (
            <Text role="alert" color="danger">
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
