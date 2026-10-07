import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';

import { GROW_STYLE, ROW_STYLE } from './TeamProfiles.styles';

interface PublishConsentRowProps {
  centerName: string;
  isGranted: boolean;
  onToggle: (isNowGranted: boolean) => void;
}

/** La autorización para publicar la imagen y los vídeos: nace desmarcada y se puede retirar cuando quiera. */
export function PublishConsentRow({
  centerName,
  isGranted,
  onToggle,
}: Readonly<PublishConsentRowProps>): React.JSX.Element {
  const label = i18n.t('teamProfiles.editor.consentLabel', { centerName });

  return (
    <View style={ROW_STYLE}>
      <View style={GROW_STYLE}>
        <Text variant="caption" color="ink2">
          {label}
        </Text>
      </View>
      <Switch isOn={isGranted} accessibilityLabel={label} onToggle={onToggle} />
    </View>
  );
}
