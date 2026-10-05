import type { Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { RegisterAccountFormValues } from '../schemas/auth-forms.schema';
import { AccountRoleField } from './AccountRoleField';
import { EmailTextField } from './EmailTextField';
import { PasswordTextField } from './PasswordTextField';
import { RegistrationConsents } from './RegistrationConsents';

interface RegisterAccountFieldsProps {
  control: Control<RegisterAccountFormValues>;
}

export function RegisterAccountFields({
  control,
}: Readonly<RegisterAccountFieldsProps>): React.JSX.Element {
  return (
    <>
      <AccountRoleField control={control} />
      <FormTextField
        control={control}
        name="fullName"
        label={i18n.t('auth.register.fullNameLabel')}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
      <EmailTextField control={control} name="email" />
      <PasswordTextField
        control={control}
        name="password"
        label={i18n.t('auth.passwordLabel')}
        helperText={i18n.t('auth.passwordHelper')}
        purpose="new"
      />
      <RegistrationConsents control={control} />
    </>
  );
}
