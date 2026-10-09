import { View } from 'react-native';

import { Text } from '@/ui/atoms/Text';

import { STACK_STYLE, TIGHT_STACK_STYLE } from './TeamProfiles.styles';

interface ProfileSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

/** Una parte del perfil, sin tarjeta como en el prototipo: su título, el consejo debajo y el contenido. */
export function ProfileSection({
  title,
  description,
  children,
}: Readonly<ProfileSectionProps>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      {title === undefined ? null : (
        <View style={TIGHT_STACK_STYLE}>
          <Text variant="bodyStrong" role="heading">
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
