import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useSignOut } from '@/features/auth';
import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useTheme, useThemePreference } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { MORE_MENU_GROUPS } from '../model/more-menu';
import { createThemeRowStyle, SECTION_STYLE, THEME_ROW_TEXT_STYLE } from './AdminMoreScreen.styles';

function DarkThemeRow(): React.JSX.Element {
  const theme = useTheme();
  const { setThemePreference } = useThemePreference();

  return (
    <View style={createThemeRowStyle(theme)}>
      <Icon name="moon" color="ink2" />
      <View style={THEME_ROW_TEXT_STYLE}>
        <Text variant="bodyStrong">{i18n.t('centerAdmin.more.darkThemeTitle')}</Text>
      </View>
      <Switch
        isOn={theme.mode === 'dark'}
        accessibilityLabel={i18n.t('centerAdmin.more.darkThemeTitle')}
        onToggle={(isOn) => {
          setThemePreference(isOn ? 'dark' : 'light');
        }}
      />
    </View>
  );
}

/** Las palabras del sector que llevan los textos del menú. */
interface MoreMenuWords {
  clientWord: string;
  routineWordPlural: string;
  clientSingular: string;
  staffSingular: string;
}

function useMoreMenuWords(): MoreMenuWords {
  const { client, routine, staff } = getSectorVocabulary(useActiveCenterSectorId());
  return {
    clientWord: client.plural,
    routineWordPlural: routine.plural,
    clientSingular: client.singular,
    staffSingular: staff.singular,
  };
}

/** Prototipo `amore`: los accesos de administración agrupados, el tema y cerrar sesión. */
export function AdminMoreScreen(): React.JSX.Element {
  const router = useRouter();
  const { signOut, isSigningOut } = useSignOut();
  const words = useMoreMenuWords();

  return (
    <ScreenTemplate title={i18n.t('centerAdmin.more.title')} isLoading={isSigningOut}>
      {MORE_MENU_GROUPS.map((group) => (
        <View key={group.id} style={SECTION_STYLE}>
          <Text variant="overline" color="ink2">
            {i18n.t(`centerAdmin.more.${group.id}Section`)}
          </Text>
          {group.entries.map((entry) => (
            <ListItem
              key={entry.textKey}
              leadingIconName={entry.iconName}
              title={i18n.t(`centerAdmin.more.${entry.textKey}Title`, { ...words })}
              subtitle={i18n.t(`centerAdmin.more.${entry.textKey}Subtitle`)}
              onPress={() => {
                router.push(entry.route);
              }}
            />
          ))}
        </View>
      ))}
      <DarkThemeRow />
      <Button
        variant="outline"
        isFullWidth
        leadingIconName="logOut"
        label={i18n.t('actions.signOut')}
        isLoading={isSigningOut}
        onPress={signOut}
      />
    </ScreenTemplate>
  );
}
