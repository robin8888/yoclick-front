import { View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Icon } from '@/ui/atoms/Icon';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { GROW_STYLE, ROW_STYLE } from './TeamProfiles.styles';

type Certification = ProfileResponseDto['certifications'][number];

interface CertificationRowProps {
  certification: Certification;
  /** Botón que acompaña a la fila: quitar (quien la escribe) o verificar (la administración). */
  action?: React.ReactNode;
}

/** Una titulación con su estado dicho con palabras: verificada por el centro o pendiente. */
export function CertificationRow({
  certification,
  action,
}: Readonly<CertificationRowProps>): React.JSX.Element {
  return (
    <View style={ROW_STYLE}>
      <Icon
        name={certification.isVerified ? 'check' : 'file'}
        color={certification.isVerified ? 'success' : 'ink2'}
      />
      <View accessible style={GROW_STYLE}>
        <Text variant="bodyStrong">{certification.name}</Text>
        <Text variant="caption" color="ink2">
          {[
            certification.detail,
            i18n.t(
              certification.isVerified
                ? 'teamProfiles.editor.verified'
                : 'teamProfiles.editor.notVerified',
            ),
          ]
            .filter((part) => part !== null)
            .join(' · ')}
        </Text>
      </View>
      {action}
    </View>
  );
}

export function RemoveCertificationButton({
  name,
  onPress,
}: Readonly<{ name: string; onPress: () => void }>): React.JSX.Element {
  return (
    <IconButton
      iconName="close"
      variant="tonal"
      accessibilityLabel={i18n.t('teamProfiles.editor.removeCertificationLabel', { name })}
      onPress={onPress}
    />
  );
}
