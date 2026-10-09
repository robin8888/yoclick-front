import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSummary } from '@/features/auth';
import { useActiveCenterSectorId } from '@/features/join';
import { MyPhotoAvatar } from '@/features/photos';
import { useSessionStore } from '@/shared/auth/session-store';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { PROFILE_HEADER_STYLE } from './StaffProfileScreen.styles';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

interface ProfileLink {
  label: string;
  iconName: 'play' | 'file' | 'calendar';
  route:
    '/(staff)/routines' | '/(staff)/content' | '/(staff)/public-profile' | '/(staff)/availability';
}

/** Los accesos del perfil del equipo: sus rutinas (o prácticas, tareas…), los contenidos y su disponibilidad. */
function StaffProfileLinks({
  routineWordPlural,
}: Readonly<{ routineWordPlural: string }>): React.JSX.Element {
  const router = useRouter();
  const links: readonly ProfileLink[] = [
    { label: capitalize(routineWordPlural), iconName: 'play', route: '/(staff)/routines' },
    { label: i18n.t('content.admin.title'), iconName: 'file', route: '/(staff)/content' },
    {
      label: i18n.t('teamProfiles.editor.title'),
      iconName: 'play',
      route: '/(staff)/public-profile',
    },
    {
      label: i18n.t('session.profile.availabilityAction'),
      iconName: 'calendar',
      route: '/(staff)/availability',
    },
  ];

  return (
    <>
      {links.map((link) => (
        <Button
          key={link.route}
          variant="outline"
          leadingIconName={link.iconName}
          label={link.label}
          isFullWidth
          onPress={() => {
            router.push(link.route);
          }}
        />
      ))}
    </>
  );
}

/** Prototipo `iagenda` › Perfil: quién eres, en qué centro y cómo cerrar la sesión. */
export function StaffProfileScreen(): React.JSX.Element {
  const user = useSessionStore((state) => state.user);
  const center = useActiveCenterSummary();
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const staffWord = vocabulary.staff.singular;
  const { signOut, isSigningOut } = useSignOutFlow();

  return (
    <ScreenTemplate title={i18n.t('session.profile.title')} isLoading={isSigningOut}>
      <View style={PROFILE_HEADER_STYLE}>
        <MyPhotoAvatar name={user?.fullName ?? ''} />
        <Text variant="titleLg">{user?.fullName ?? ''}</Text>
        <Text color="ink2">{user?.email ?? ''}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('session.profile.roleAtCenter', {
            role: capitalize(staffWord),
            centerName: center.name,
          })}
        </Text>
      </View>
      <StaffProfileLinks routineWordPlural={vocabulary.routine.plural} />
      <Button
        variant="outline"
        leadingIconName="logOut"
        label={i18n.t('actions.signOut')}
        isFullWidth
        isLoading={isSigningOut}
        onPress={signOut}
      />
    </ScreenTemplate>
  );
}
