import { useState } from 'react';
import { View } from 'react-native';

import { PasswordConfirmForm } from '@/features/privacy';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useExportClientData } from '../hooks/useExportClientData';

const STACK_STYLE = { gap: 8 } as const;

/** «Exportar sus datos» de la ficha: el derecho de acceso (RGPD) se responde con todo lo que el centro guarda. */
export function ClientDataExportSection({
  membershipId,
}: Readonly<{ membershipId: string }>): React.JSX.Element {
  const [isAskingPassword, setIsAskingPassword] = useState(false);
  const exportData = useExportClientData(membershipId);

  return (
    <View style={STACK_STYLE}>
      {isAskingPassword ? (
        <PasswordConfirmForm
          description={i18n.t('centerAdmin.clientDataExport.hint')}
          passwordLabel={i18n.t('centerAdmin.clientDataExport.passwordLabel')}
          confirmLabel={i18n.t('centerAdmin.clientDataExport.confirmAction')}
          isRunning={exportData.isRunning}
          errorMessage={exportData.errorMessage}
          onSubmit={exportData.run}
        />
      ) : (
        <>
          <Button
            variant="outline"
            leadingIconName="file"
            label={i18n.t('centerAdmin.clientDataExport.action')}
            onPress={() => {
              setIsAskingPassword(true);
            }}
          />
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.clientDataExport.hint')}
          </Text>
        </>
      )}
    </View>
  );
}
