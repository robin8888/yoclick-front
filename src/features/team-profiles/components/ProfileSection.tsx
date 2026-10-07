import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createCardStyle, TIGHT_STACK_STYLE } from './TeamProfiles.styles';

interface ProfileSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

/** Una parte del perfil en su propia tarjeta, con título y una línea que explica para qué sirve. */
export function ProfileSection({
  title,
  description,
  children,
}: Readonly<ProfileSectionProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCardStyle(theme)}>
      {title === undefined ? null : (
        <View style={TIGHT_STACK_STYLE}>
          <Text variant="titleMd" role="heading">
            {title}
          </Text>
          {description === undefined ? null : (
            <Text variant="caption" color="ink2">
              {description}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
}
