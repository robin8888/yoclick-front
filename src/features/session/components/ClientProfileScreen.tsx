import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSummary, useSignOut } from '@/features/auth';
import { useActiveCenterSectorId, useMyCenters } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { useTheme } from '@/shared/theme';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { createProfileListStyle } from './ClientProfileScreen.styles';
import { DarkThemeRow, ProfileFooter, ProfileHeader } from './ProfileParts';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
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

/** Prototipo `profile`: foto, nombre y correo, accesos, tema y cerrar sesión; igual que el del profesor y el centro. */
export function ClientProfileScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const center = useActiveCenterSummary();
  const { signOut, isSigningOut } = useSignOut();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.singular;

  return (
    <ScreenTemplate
      onBackPress={onBackPress}
      title={i18n.t('session.profile.title')}
      isLoading={isSigningOut}
    >
      <ProfileHeader roleLabel={capitalize(clientWord)} centerName={center.name} />
      <ClientProfileLinks />
      <ProfileFooter isSigningOut={isSigningOut} onSignOut={signOut} />
    </ScreenTemplate>
  );
}
