import { useRouter, type Href } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSummary, useSignOut } from '@/features/auth';
import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

const IDENTITY_STYLE = { flexDirection: 'row', alignItems: 'center', gap: 16 } as const;
const SECTION_STYLE = { gap: 12 } as const;

interface AdminLink {
  route: Href;
  iconName: 'calendar' | 'qrCode' | 'users';
  title: () => string;
  subtitle: () => string;
}

const CENTER_LINKS: readonly AdminLink[] = [
  {
    route: '/(admin)/services',
    iconName: 'calendar',
    title: () => i18n.t('centerAdmin.more.servicesTitle'),
    subtitle: () => i18n.t('centerAdmin.more.servicesSubtitle'),
  },
  {
    route: '/(admin)/invite-clients',
    iconName: 'qrCode',
    title: () => i18n.t('centerAdmin.more.inviteClientsTitle'),
    subtitle: () => i18n.t('centerAdmin.more.inviteClientsSubtitle'),
  },
  {
    route: '/(admin)/invite-team',
    iconName: 'users',
    title: () => i18n.t('centerAdmin.more.inviteTeamTitle'),
    subtitle: () => i18n.t('centerAdmin.more.inviteTeamSubtitle'),
  },
];

/** Prototipo `amore`: accesos de administración del centro. */
export function AdminMoreScreen(): React.JSX.Element {
  const router = useRouter();
  const { signOut, isSigningOut } = useSignOut();
  const activeCenter = useActiveCenterSummary();

  return (
    <ScreenTemplate title={i18n.t('centerAdmin.more.title')}>
      <View style={IDENTITY_STYLE}>
        <Avatar name={activeCenter.name} photoUrl={activeCenter.logoUrl} size="xl" isDecorative />
        <Text variant="titleMd">{activeCenter.name}</Text>
      </View>
      <View style={SECTION_STYLE}>
        <Text variant="overline" color="ink2">
          {i18n.t('centerAdmin.more.centerSection')}
        </Text>
        {CENTER_LINKS.map((link) => (
          <ListItem
            key={link.iconName}
            leadingIconName={link.iconName}
            title={link.title()}
            subtitle={link.subtitle()}
            onPress={() => {
              router.push(link.route);
            }}
          />
        ))}
      </View>
      <Button
        variant="outline"
        leadingIconName="logOut"
        label={i18n.t('actions.signOut')}
        isLoading={isSigningOut}
        onPress={signOut}
      />
    </ScreenTemplate>
  );
}
