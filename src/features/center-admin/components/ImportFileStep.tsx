import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { SECTION_STACK_STYLE } from './ImportSteps.styles';

interface ImportFileStepProps {
  clientWord: string;
  errorMessage: string | null;
  onChooseFilePress: () => void;
}

/** Paso 1: elegir el CSV. */
export function ImportFileStep({
  clientWord,
  errorMessage,
  onChooseFilePress,
}: Readonly<ImportFileStepProps>): React.JSX.Element {
  return (
    <View style={SECTION_STACK_STYLE}>
      <Text variant="body" color="ink2">
        {i18n.t('centerAdmin.importClients.file.intro', { clientWord })}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.importClients.file.pickHint', { clientWord })}
      </Text>
      {errorMessage ? <FormErrorBanner message={errorMessage} /> : null}
      <Button
        label={i18n.t('centerAdmin.importClients.file.pickAction')}
        leadingIconName="file"
        isFullWidth
        onPress={onChooseFilePress}
      />
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.importClients.file.tip')}
      </Text>
    </View>
  );
}
