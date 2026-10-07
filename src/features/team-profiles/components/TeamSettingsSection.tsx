import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useSaveTeamSettings } from '../hooks/useTeamProfileMutations';
import { useTeamSettings } from '../hooks/useTeamProfileQueries';
import { createCardStyle, GROW_STYLE, ROW_STYLE, STACK_STYLE } from './TeamProfiles.styles';

interface SettingRowProps {
  title: string;
  hint: string;
  isOn: boolean;
  isDisabled: boolean;
  onToggle: (isNowOn: boolean) => void;
}

function SettingRow({
  title,
  hint,
  isOn,
  isDisabled,
  onToggle,
}: Readonly<SettingRowProps>): React.JSX.Element {
  return (
    <View style={ROW_STYLE}>
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" color="ink2">
          {hint}
        </Text>
      </View>
      <Switch isOn={isOn} isDisabled={isDisabled} accessibilityLabel={title} onToggle={onToggle} />
    </View>
  );
}

/** Dos interruptores del centro: enseñar el equipo en la web de reservas y revisar las opiniones antes de publicarlas. */
export function TeamSettingsSection(): React.JSX.Element | null {
  const theme = useTheme();
  const settings = useTeamSettings();
  const save = useSaveTeamSettings();

  if (settings.data === undefined) return null;
  return (
    <View style={STACK_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('teamProfiles.admin.settingsTitle')}
      </Text>
      <View style={createCardStyle(theme)}>
        <SettingRow
          title={i18n.t('teamProfiles.admin.showOnWebTitle')}
          hint={i18n.t('teamProfiles.admin.showOnWebHint')}
          isOn={settings.data.showTeamOnWeb}
          isDisabled={save.isRunning}
          onToggle={(isShown) => {
            save.run({ showTeamOnWeb: isShown });
          }}
        />
        <SettingRow
          title={i18n.t('teamProfiles.admin.reviewOpinionsTitle')}
          hint={i18n.t('teamProfiles.admin.reviewOpinionsHint')}
          isOn={settings.data.reviewsNeedApproval}
          isDisabled={save.isRunning}
          onToggle={(isRequired) => {
            save.run({ reviewsNeedApproval: isRequired });
          }}
        />
      </View>
      {save.errorMessage === null ? null : <FormErrorBanner message={save.errorMessage} />}
    </View>
  );
}
