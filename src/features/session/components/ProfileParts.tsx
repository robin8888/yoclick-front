import Constants from 'expo-constants';
import { View } from 'react-native';

import { MyPhotoAvatar } from '@/features/photos';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { useTheme, useThemePreference } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';

import {
  createProfileHeaderStyle,
  createThemeRowStyle,
  PROFILE_HEADER_TEXT_STYLE,
  THEME_ROW_TEXT_STYLE,
} from './ClientProfileScreen.styles';

interface ProfileHeaderProps {
  /** «Alumno», «Profesor», «Administración»: lo que es en el centro. */
  roleLabel: string;
  centerName: string;
}

/** La cabecera de «Mi perfil»: la misma para el alumno, el profesor y el centro. */
export function ProfileHeader({
  roleLabel,
  centerName,
}: Readonly<ProfileHeaderProps>): React.JSX.Element {
  const theme = useTheme();
  const user = useSessionStore((state) => state.user);

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
        <Badge label={roleLabel} tone="brand" />
        {centerName === '' ? null : (
          <Text variant="caption" color="ink2" numberOfLines={1}>
            {centerName}
          </Text>
        )}
      </View>
    </View>
  );
}

/** El interruptor del tema oscuro, igual en los tres perfiles. */
export function DarkThemeRow(): React.JSX.Element {
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

interface ProfileFooterProps {
  isSigningOut: boolean;
  onSignOut: () => void;
}

/** «Cerrar sesión» y la versión de la app, al final de los tres perfiles. */
export function ProfileFooter({
  isSigningOut,
  onSignOut,
}: Readonly<ProfileFooterProps>): React.JSX.Element {
  const appVersion = Constants.expoConfig?.version ?? '1.0';

  return (
    <>
      <Button
        variant="outline"
        leadingIconName="logOut"
        label={i18n.t('actions.signOut')}
        isFullWidth
        isLoading={isSigningOut}
        onPress={onSignOut}
      />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('session.profile.version', { version: appVersion })}
      </Text>
    </>
  );
}
