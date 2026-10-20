import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { CenterSettingsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useCenterSettings } from '../hooks/useCenterSettings';
import { useToggleCenterModule } from '../hooks/useToggleCenterModule';
import { CENTER_MODULE_ENTRIES } from '../model/center-module-entries';
import { createModuleRowStyle, MODULE_TEXT_STYLE } from './CenterModulesScreen.styles';

function ModuleRows({
  settings,
}: Readonly<{ settings: CenterSettingsResponseDto }>): React.JSX.Element {
  const theme = useTheme();
  const { toggleModule, isSaving, saveErrorMessage } = useToggleCenterModule(settings.version);

  return (
    <>
      {saveErrorMessage === null ? null : <FormErrorBanner message={saveErrorMessage} />}
      {CENTER_MODULE_ENTRIES.map((moduleId) => (
        <View key={moduleId} style={createModuleRowStyle(theme)}>
          <View style={MODULE_TEXT_STYLE}>
            <Text variant="bodyStrong">{i18n.t(`centerAdmin.modules.${moduleId}.title`)}</Text>
            <Text variant="caption" color="ink2">
              {i18n.t(`centerAdmin.modules.${moduleId}.description`)}
            </Text>
          </View>
          <Switch
            isOn={settings.modules[moduleId]}
            isDisabled={isSaving}
            accessibilityLabel={i18n.t(`centerAdmin.modules.${moduleId}.title`)}
            onToggle={(isOn) => {
              toggleModule(moduleId, isOn);
            }}
          />
        </View>
      ))}
    </>
  );
}

/** Lo que usa el centro: un taller o una consulta apaga bonos, salas o asistencia y se queda con las citas. */
export function CenterModulesScreen(): React.JSX.Element {
  const router = useRouter();
  const settings = useCenterSettings();

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.modules.title')}
      subtitle={i18n.t('centerAdmin.modules.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {settings.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {settings.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.modules.errorTitle')}
          error={settings.error}
          onRetry={() => void settings.refetch()}
          isRetrying={settings.isFetching}
        />
      ) : null}
      {settings.data === undefined ? null : <ModuleRows settings={settings.data} />}
    </ScreenTemplate>
  );
}
