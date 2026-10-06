import { View } from 'react-native';

import { useActiveCenterSummary } from '@/features/auth';
import { useActiveCenterSectorId } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { PROFILE_HEADER_STYLE } from './StaffProfileScreen.styles';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

/** Prototipo `iagenda` › Perfil: quién eres, en qué centro y cómo cerrar la sesión. */
export function StaffProfileScreen(): React.JSX.Element {
  const user = useSessionStore((state) => state.user);
  const center = useActiveCenterSummary();
  const staffWord = getSectorVocabulary(useActiveCenterSectorId()).staff.singular;
  const { signOut, isSigningOut } = useSignOutFlow();

  return (
    <ScreenTemplate title={i18n.t('session.profile.title')} isLoading={isSigningOut}>
      <View style={PROFILE_HEADER_STYLE}>
        <Avatar name={user?.fullName ?? ''} size="xl" isDecorative />
        <Text variant="titleLg">{user?.fullName ?? ''}</Text>
        <Text color="ink2">{user?.email ?? ''}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('session.profile.roleAtCenter', {
            role: capitalize(staffWord),
            centerName: center.name,
          })}
        </Text>
      </View>
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
