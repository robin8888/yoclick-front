import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';
import { SignOutAction } from '@/features/session';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';

import { LargeCodeField } from '../components/LargeCodeField';
import { useJoinCodeForm } from '../hooks/useJoinCodeForm';
import { MAX_JOIN_CODE_INPUT_LENGTH } from '../model/join-code';
import { getJoinCodeErrorMessage } from './join-error-messages';

// Logotipo completo en blanco, del mismo tamaño que en el inicio de sesión y el registro.
const CODE_LOGO_HEIGHT = 110;

/** Prototipo `jcode`. */
export function JoinCodeScreen(): React.JSX.Element {
  const signOut = useSignOutFlow();
  const router = useRouter();
  const { control, submitJoinCode, isSearching, searchError } = useJoinCodeForm();

  return (
    <ScreenTemplate
      title={i18n.t('join.code.title')}
      subtitle={i18n.t('join.code.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground
      isHeaderCentered
      isLoading={isSearching || signOut.isSigningOut}
      headerAccessory={<Logo variant="lockup" height={CODE_LOGO_HEIGHT} />}
      footer={
        <Button
          label={i18n.t('join.code.submitLabel')}
          isFullWidth
          isLoading={isSearching}
          onPress={submitJoinCode}
        />
      }
    >
      {searchError === null ? null : (
        <FormErrorBanner message={getJoinCodeErrorMessage(searchError)} />
      )}
      <LargeCodeField
        control={control}
        name="joinCode"
        label={i18n.t('join.code.fieldLabel')}
        placeholder={i18n.t('join.code.placeholder')}
        helperText={i18n.t('join.code.fieldHelper')}
        maxLength={MAX_JOIN_CODE_INPUT_LENGTH}
        onSubmitEditing={submitJoinCode}
      />
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
