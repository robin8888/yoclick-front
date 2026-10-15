import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSummary, useSignOut } from '@/features/auth';
import { useActiveCenterSectorId, useMyCenters } from '@/features/join';
import { MyPhotoAvatar } from '@/features/photos';
import { useSessionStore } from '@/shared/auth/session-store';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { useTheme, useThemePreference } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import {
  createProfileHeaderStyle,
  createProfileListStyle,
  createThemeRowStyle,
  PROFILE_HEADER_TEXT_STYLE,
  THEME_ROW_TEXT_STYLE,
} from './ClientProfileScreen.styles';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

function ClientProfileHeader(): React.JSX.Element {
  const theme = useTheme();
  const user = useSessionStore((state) => state.user);
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.singular;

  return (
    <View style={createProfileHeaderStyle(theme)}>
      <MyPhotoAvatar name={user?.fullName ?? ''} />
      <View style={PROFILE_HEADER_TEXT_STYLE}>
        <Text variant="titleMd" numberOfLines={2}>
          {user?.fullName ?? ''}
        </Text>
        <Text variant="caption" color="ink2" numberOfLines={1}>
          {user?.email ?? ''}
        </Text>
        <Badge label={capitalize(clientWord)} tone="brand" />
      </View>
    </View>
  );
}

function DarkThemeRow(): React.JSX.Element {
  const theme = useTheme();
  const { setThemePreference } = useThemePreference();
  const title = i18n.t('session.profile.darkTheme');

  return (
    <View style={createThemeRowStyle(theme)}>
      <Icon name="moon" color="brandInk" />
      <View style={THEME_ROW_TEXT_STYLE}>
        <Text variant="bodyStrong">{title}</Text>
      </View>
      <Switch
        isOn={theme.mode === 'dark'}
        accessibilityLabel={title}
        onToggle={(isOn) => {
          setThemePreference(isOn ? 'dark' : 'light');
        }}
      />
    </View>
  );
}

interface ProfileLinkEntry {
  iconName: 'mapPin' | 'user' | 'bell' | 'lock' | 'messageCircle';
  title: string;
  subtitle?: string;
  route:
    | '/(client)/centers'
    | '/(client)/my-data'
    | '/(client)/notifications'
    | '/(client)/privacy'
    | '/(client)/messages';
}

function useClientProfileEntries(): readonly ProfileLinkEntry[] {
  const center = useActiveCenterSummary();
  const { data: myCenters } = useMyCenters({ isEnabled: true });
  const centerCount =
    myCenters?.memberships.filter(({ status }) => status === 'active').length ?? 1;

  return [
    {
      iconName: 'mapPin',
      title: i18n.t('join.centers.title'),
      subtitle: i18n.t('session.profile.centersSubtitle', {
        count: centerCount,
        centerName: center.name,
      }),
      route: '/(client)/centers',
    },
    {
      iconName: 'user',
      title: i18n.t('session.myData.title'),
      subtitle: i18n.t('session.profile.myDataSubtitle'),
      route: '/(client)/my-data',
    },
    { iconName: 'messageCircle', title: i18n.t('chat.title'), route: '/(client)/messages' },
    { iconName: 'bell', title: i18n.t('notifications.title'), route: '/(client)/notifications' },
    { iconName: 'lock', title: i18n.t('privacy.title'), route: '/(client)/privacy' },
  ];
}

function ClientProfileLinks(): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();
  const entries = useClientProfileEntries();

  return (
    <View style={createProfileListStyle(theme)}>
      {entries.map((entry) => (
        <ListItem
          key={entry.route}
          leadingIconName={entry.iconName}
          title={entry.title}
          subtitle={entry.subtitle}
          onPress={() => {
            router.push(entry.route);
          }}
        />
      ))}
      <DarkThemeRow />
    </View>
  );
}

/** Prototipo `profile`: foto, nombre y correo, accesos (centros, avisos, privacidad), tema y cerrar sesión. */
export function ClientProfileScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const { signOut, isSigningOut } = useSignOut();
  const appVersion = Constants.expoConfig?.version ?? '1.0';

  return (
    <ScreenTemplate
      onBackPress={onBackPress}
      title={i18n.t('session.profile.title')}
      isLoading={isSigningOut}
    >
      <ClientProfileHeader />
      <ClientProfileLinks />
      <Button
        variant="outline"
        leadingIconName="logOut"
        label={i18n.t('actions.signOut')}
        isFullWidth
        isLoading={isSigningOut}
        onPress={signOut}
      />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('session.profile.version', { version: appVersion })}
      </Text>
    </ScreenTemplate>
  );
}
