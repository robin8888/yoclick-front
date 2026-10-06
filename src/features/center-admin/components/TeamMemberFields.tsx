import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import { MAX_STAFF_TITLE_LENGTH, type TeamMemberDraft } from '../model/team-member-changes';
import type { EditableTeamRole } from '../model/team-roster';

interface TeamMemberFieldsProps {
  draft: TeamMemberDraft;
  /** «Instructor», «Profesor»…: cómo se llama quien da las sesiones en este sector. */
  staffWord: string;
  onDraftChange: (changes: Partial<TeamMemberDraft>) => void;
}

const FIELDS_STYLE = { gap: 16 } as const;

/** Rol (administración o quien da las sesiones) y cargo que ve la clientela. */
export function TeamMemberFields({
  draft,
  staffWord,
  onDraftChange,
}: Readonly<TeamMemberFieldsProps>): React.JSX.Element {
  return (
    <View style={FIELDS_STYLE}>
      <View style={FIELDS_STYLE}>
        <Text variant="bodyStrong">{i18n.t('centerAdmin.team.roleLabel')}</Text>
        <SegmentedControl<EditableTeamRole>
          options={[
            { value: 'staff', label: staffWord },
            { value: 'admin', label: i18n.t('centerAdmin.team.roles.admin') },
          ]}
          selectedValue={draft.role}
          onValueChange={(role) => {
            onDraftChange({ role });
          }}
        />
        <Text variant="caption" color="ink2">
          {i18n.t(
            draft.role === 'admin'
              ? 'centerAdmin.team.adminHelper'
              : 'centerAdmin.team.staffHelper',
          )}
        </Text>
      </View>
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
