import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormTextField } from '@/ui/molecules/FormTextField';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { EmailTextField } from '../components/EmailTextField';
import { PasswordTextField } from '../components/PasswordTextField';
import { RegistrationConsents } from '../components/RegistrationConsents';
import { useRegisterAccountForm } from '../hooks/useRegisterAccountForm';

/** Prototipo `reg1`. La foto de perfil opcional llega con APP-8 (cámara y galería). */
export function RegisterAccountScreen(): React.JSX.Element {
  const router = useRouter();
  const { control, continueToGoals } = useRegisterAccountForm();

  return (
    <ScreenTemplate
      title={i18n.t('auth.register.title')}
      subtitle={i18n.t('auth.register.accountSubtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('auth.register.continueLabel')}
          isFullWidth
          onPress={continueToGoals}
        />
      }
    >
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
    </ScreenTemplate>
  );
}
