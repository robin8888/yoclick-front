import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { useInviteInstructorForm } from '../hooks/useInviteInstructorForm';
import { PendingInvitationRow } from './PendingInvitationRow';

const FIELDS_STYLE = { gap: 16 } as const;

interface InstructorInviteFieldsProps {
  form: ReturnType<typeof useInviteInstructorForm>;
}

/** Correo del instructor, botón «Añadir» y las invitaciones que ya están enviadas. */
export function InstructorInviteFields({
  form,
}: Readonly<InstructorInviteFieldsProps>): React.JSX.Element {
  return (
    <View style={FIELDS_STYLE}>
      <FormTextField
        control={form.control}
        name="email"
        label={i18n.t('centerAdmin.team.emailLabel')}
        helperText={i18n.t('centerAdmin.team.emailHelper')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={form.submitInvitation}
      />
      <Button
        variant="secondary"
        leadingIconName="mail"
        label={i18n.t('centerAdmin.team.addAction')}
        onPress={form.submitInvitation}
      />
      {form.inviteErrorMessage === null ? null : (
        <FormErrorBanner message={form.inviteErrorMessage} />
      )}
      {form.pendingInvitations.map((invitation) => (
        <PendingInvitationRow key={invitation.id} email={invitation.email} />
      ))}
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.team.laterHint')}
      </Text>
    </View>
  );
}
