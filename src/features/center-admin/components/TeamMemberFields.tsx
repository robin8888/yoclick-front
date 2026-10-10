import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import { ServiceSelectionField } from './ServiceSelectionField';
import { TeamPermissionsSection } from './TeamPermissionsSection';
import { MAX_STAFF_TITLE_LENGTH, type TeamMemberDraft } from '../model/team-member-changes';
import type { EditableTeamRole } from '../model/team-roster';

interface TeamMemberFieldsProps {
  draft: TeamMemberDraft;
  /** «Instructor», «Profesor»…: cómo se llama quien da las sesiones en este sector. */
  staffWord: string;
  /** «Clientes», «Alumnos»…: cómo se llama quien reserva en este sector. */
  clientWord: string;
  onDraftChange: (changes: Partial<TeamMemberDraft>) => void;
}

const FIELDS_STYLE = { gap: 16 } as const;

interface TeamRoleFieldProps {
  selectedRole: EditableTeamRole;
  staffWord: string;
  onRoleChange: (role: EditableTeamRole) => void;
}

function TeamRoleField({
  selectedRole,
  staffWord,
  onRoleChange,
}: Readonly<TeamRoleFieldProps>): React.JSX.Element {
  return (
    <View style={FIELDS_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.team.roleLabel')}</Text>
      <SegmentedControl<EditableTeamRole>
        options={[
          { value: 'staff', label: staffWord },
          { value: 'admin', label: i18n.t('centerAdmin.team.roles.admin') },
        ]}
        selectedValue={selectedRole}
        onValueChange={onRoleChange}
      />
      <Text variant="caption" color="ink2">
        {i18n.t(
          selectedRole === 'admin'
            ? 'centerAdmin.team.adminHelper'
            : 'centerAdmin.team.staffHelper',
        )}
      </Text>
    </View>
  );
}

interface TeamServicesFieldProps {
  staffWord: string;
  serviceIds: string[];
  onServiceIdsChange: (serviceIds: string[]) => void;
}

/** Los servicios de la academia que da esta persona. */
function TeamServicesField({
  staffWord,
  serviceIds,
  onServiceIdsChange,
}: Readonly<TeamServicesFieldProps>): React.JSX.Element {
  return (
    <ServiceSelectionField
      title={i18n.t('centerAdmin.team.servicesLabel', { staffWord })}
      helperText={i18n.t('centerAdmin.team.servicesHelper')}
      selectedServiceIds={serviceIds}
      onSelectedServiceIdsChange={onServiceIdsChange}
    />
  );
}

/** Lo que solo aplica a quien da las sesiones: permisos extra y servicios que da. */
function StaffOnlyFields({
  draft,
  staffWord,
  clientWord,
  onDraftChange,
}: Readonly<TeamMemberFieldsProps>): React.JSX.Element {
  return (
    <>
      <TeamPermissionsSection
        grantedPermissions={draft.grantedPermissions}
        clientWord={clientWord}
        onGrantedPermissionsChange={(grantedPermissions) => {
          onDraftChange({ grantedPermissions });
        }}
      />
      <TeamServicesField
        staffWord={staffWord}
        serviceIds={draft.serviceIds}
        onServiceIdsChange={(serviceIds) => {
          onDraftChange({ serviceIds });
        }}
      />
    </>
  );
}

/** Rol (administración o quien da las sesiones), servicios que da y cargo que ve la clientela. */
export function TeamMemberFields({
  draft,
  staffWord,
  clientWord,
  onDraftChange,
}: Readonly<TeamMemberFieldsProps>): React.JSX.Element {
  return (
    <View style={FIELDS_STYLE}>
      <TeamRoleField
        selectedRole={draft.role}
        staffWord={staffWord}
        onRoleChange={(role) => {
          onDraftChange({ role });
        }}
      />
      {draft.role === 'staff' ? (
        <StaffOnlyFields
          draft={draft}
          staffWord={staffWord}
          clientWord={clientWord}
          onDraftChange={onDraftChange}
        />
      ) : null}
      <FormField
        label={i18n.t('centerAdmin.team.titleLabel')}
        helperText={i18n.t('centerAdmin.team.titleHelper')}
        value={draft.staffTitle}
        onChangeText={(staffTitle) => {
          onDraftChange({ staffTitle });
        }}
        maxLength={MAX_STAFF_TITLE_LENGTH}
      />
    </View>
  );
}
