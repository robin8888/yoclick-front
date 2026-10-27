import { View } from 'react-native';

import { useActiveCenterModules } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useCenterSettings } from '../hooks/useCenterSettings';
import { useSaveCenterSettings } from '../hooks/useSaveCenterSettings';
import { createAutoStartCardStyle, createAutoStartTextStyle } from './AutoStartSwitch.styles';

/**
 * «Iniciar las clases (o los servicios) automáticamente»: con él activado, cada clase o cita se
 * inicia sola a su hora y la agenda cuenta el tiempo que lleva. Solo lo ve quien administra el centro
 * (los ajustes del centro exigen ese permiso).
 */
export function AutoStartSwitch(): React.JSX.Element | null {
  const theme = useTheme();
  const settings = useCenterSettings();
  const { saveSettings, isSaving, saveErrorMessage } = useSaveCenterSettings(
    settings.data?.version ?? '',
  );
  const wordKey = useActiveCenterModules().rooms ? 'classes' : 'services';

  if (settings.data === undefined) return null;
  const title = i18n.t(`centerAdmin.autoStart.${wordKey}.title`);
  return (
    <>
      <View style={createAutoStartCardStyle(theme)}>
        <View style={createAutoStartTextStyle(theme)}>
          <Text variant="bodyStrong">{title}</Text>
          <Text variant="caption" color="ink2">
            {i18n.t(`centerAdmin.autoStart.${wordKey}.hint`)}
          </Text>
        </View>
        <Switch
          isOn={settings.data.autoStartSessions}
          isDisabled={isSaving}
          accessibilityLabel={title}
          onToggle={(isNowOn) => {
            saveSettings({ autoStartSessions: isNowOn });
          }}
        />
      </View>
      {saveErrorMessage === null ? null : <FormErrorBanner message={saveErrorMessage} />}
    </>
  );
}
