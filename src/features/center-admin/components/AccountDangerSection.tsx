import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useLegalLinks } from '@/shared/legal/useLegalLinks';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { LegalLinks } from '@/ui/molecules/LegalLinks';

import { REPORT_SECTION_STYLE } from './ReportCard.styles';

/**
 * Los textos legales y el borrado de la cuenta, al final de la seguridad de la cuenta del propietario
 * (Apple 5.1.1(i) y (v)). Borrar la cuenta cierra su centro: la pantalla de destino lo explica y lo confirma.
 */
export function AccountDangerSection(): React.JSX.Element {
  const router = useRouter();
  const legal = useLegalLinks();

  return (
    <View style={REPORT_SECTION_STYLE}>
      <Text variant="titleMd">{i18n.t('legal.title')}</Text>
      <LegalLinks
        links={legal.links}
        errorMessage={legal.hasOpenFailed ? i18n.t('legal.openFailed') : undefined}
      />
      <Button
        variant="danger"
        leadingIconName="trash"
        label={i18n.t('privacy.delete.openAction')}
        onPress={() => {
          router.push('/(admin)/delete-account');
        }}
      />
    </View>
  );
}
