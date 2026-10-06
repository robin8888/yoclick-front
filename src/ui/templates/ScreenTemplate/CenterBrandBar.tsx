import { View } from 'react-native';

import { useCenterIdentity, useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import { createCenterBrandBarStyle } from './ScreenTemplate.styles';

/** Logo y nombre del centro arriba de cada pantalla de un centro; nada fuera de uno. */
export function CenterBrandBar(): React.JSX.Element | null {
  const theme = useTheme();
  const centerIdentity = useCenterIdentity();
  if (centerIdentity === null) return null;

  return (
    <View style={createCenterBrandBarStyle(theme)}>
      <Avatar
        name={centerIdentity.name}
        photoUrl={centerIdentity.logoImageUrl}
        size="sm"
        isDecorative
      />
      <Text variant="bodyStrong" color="ink2">
        {centerIdentity.name}
      </Text>
    </View>
  );
}
