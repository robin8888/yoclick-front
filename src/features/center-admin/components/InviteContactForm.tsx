import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormTextField } from '@/ui/molecules/FormTextField';

import { parseInviteContact, type InviteContact } from '../model/invite-contact';
import { invitePersonFormSchema, type InvitePersonFormValues } from '../model/invite-form';

const FORM_STYLE = { gap: 16 } as const;

/** Un solo campo, teléfono o correo, y «Crear invitación». */
export function InviteContactForm({
  onContactSubmit,
}: Readonly<{ onContactSubmit: (contact: InviteContact) => void }>): React.JSX.Element {
  const { control, handleSubmit } = useForm<InvitePersonFormValues>({
    resolver: zodResolver(invitePersonFormSchema),
    defaultValues: { contact: '' },
  });
  const submit = handleSubmit(({ contact }) => {
    const parsedContact = parseInviteContact(contact);
    if (parsedContact !== null) onContactSubmit(parsedContact);
  });

  return (
    <View style={FORM_STYLE}>
      <FormTextField
        control={control}
        name="contact"
        label={i18n.t('centerAdmin.team.contactLabel')}
        helperText={i18n.t('centerAdmin.team.contactHelper')}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="send"
        onSubmitEditing={() => void submit()}
      />
      <Button
        label={i18n.t('centerAdmin.team.createAction')}
        isFullWidth
        onPress={() => void submit()}
      />
    </View>
  );
}
