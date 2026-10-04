import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { FormTextField } from '@/ui/molecules/FormTextField';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useJoinCodeForm } from '../hooks/useJoinCodeForm';
import { MAX_JOIN_CODE_INPUT_LENGTH } from '../model/join-code';
import { getJoinCodeErrorMessage } from './join-error-messages';

/** Prototipo `jcode`. */
export function JoinCodeScreen(): React.JSX.Element {
  const router = useRouter();
  const { control, submitJoinCode, isSearching, searchError } = useJoinCodeForm();

  return (
    <ScreenTemplate
      title={i18n.t('join.code.title')}
      subtitle={i18n.t('join.code.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
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
      <FormTextField
        control={control}
        name="joinCode"
        label={i18n.t('join.code.fieldLabel')}
        helperText={i18n.t('join.code.fieldHelper')}
        autoCapitalize="characters"
        maxLength={MAX_JOIN_CODE_INPUT_LENGTH}
        returnKeyType="search"
        onSubmitEditing={submitJoinCode}
      />
    </ScreenTemplate>
  );
}
