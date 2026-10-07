import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useExportMyData } from '../hooks/useAccountActions';
import { PasswordConfirmForm } from './PasswordConfirmForm';
import { SECTION_STYLE } from './Privacy.styles';

/** Derechos de acceso y portabilidad: una copia de los datos de la cuenta. */
export function ExportDataSection(): React.JSX.Element {
  const [isAskingPassword, setIsAskingPassword] = useState(false);
  const exportData = useExportMyData();

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('privacy.export.title')}
      </Text>
      {isAskingPassword ? (
        <PasswordConfirmForm
          description={i18n.t('privacy.export.description')}
          passwordLabel={i18n.t('privacy.export.passwordLabel')}
          confirmLabel={i18n.t('privacy.export.confirmAction')}
          isRunning={exportData.isRunning}
          errorMessage={exportData.errorMessage}
          onSubmit={exportData.run}
        />
      ) : (
        <Button
          variant="outline"
          leadingIconName="file"
          label={i18n.t('privacy.export.action')}
          onPress={() => {
            setIsAskingPassword(true);
          }}
        />
      )}
    </View>
  );
}
