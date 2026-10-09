import { Pressable } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createDropZoneStyle } from './Content.styles';

interface UploadDropZoneProps {
  isDisabled: boolean;
  onPress: () => void;
}

/** «Subir vídeo o PDF»: el recuadro con borde discontinuo del prototipo `acontent`. */
export function UploadDropZone({
  isDisabled,
  onPress,
}: Readonly<UploadDropZoneProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={i18n.t('content.admin.uploadTitle')}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={createDropZoneStyle(theme)}
    >
      <Icon name="plus" color="brandInk" />
      <Text variant="bodyStrong">{i18n.t('content.admin.uploadTitle')}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('content.admin.uploadHint')}
      </Text>
    </Pressable>
  );
}
