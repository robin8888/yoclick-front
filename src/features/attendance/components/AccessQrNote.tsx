import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { ACCESS_QR_NOTE_TEXT_STYLE, createAccessQrNoteStyle } from './AccessPassCard.styles';

/** Aviso bajo el QR: cuándo enseñarlo y por qué no vale una captura. */
export function AccessQrNote(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createAccessQrNoteStyle(theme)}>
      <Icon name="info" color="ink2" />
      <View style={ACCESS_QR_NOTE_TEXT_STYLE}>
        <Text variant="caption" color="ink2">
          {i18n.t('attendance.accessQr.note')}
        </Text>
      </View>
    </View>
  );
}
