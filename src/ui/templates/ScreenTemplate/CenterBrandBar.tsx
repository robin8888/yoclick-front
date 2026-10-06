import { View } from 'react-native';

import { useCenterIdentity, useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import { CENTER_BRAND_TEXT_STYLE, createCenterBrandBarStyle } from './ScreenTemplate.styles';

/**
 * Arriba de cada pantalla de un centro: su logo y nombre en grande y, debajo, quién ha entrado
 * y con qué papel (propietario, instructor, alumno). Nada fuera de un centro.
 */
export function CenterBrandBar(): React.JSX.Element | null {
  const theme = useTheme();
  const centerIdentity = useCenterIdentity();
  if (centerIdentity === null) return null;

  return (
    <View style={createCenterBrandBarStyle(theme)}>
      <Avatar
        name={centerIdentity.name}
        photoUrl={centerIdentity.logoImageUrl}
        size="xl"
        isDecorative
      />
      <View style={CENTER_BRAND_TEXT_STYLE}>
        <Text variant="titleMd" numberOfLines={1}>
          {centerIdentity.name}
        </Text>
        {centerIdentity.personName === null ? null : (
          <Text color="ink2" numberOfLines={1}>
            {centerIdentity.personName}
          </Text>
        )}
        {centerIdentity.roleLabel === null ? null : (
          <Text variant="caption" color="brandInk" numberOfLines={1}>
            {centerIdentity.roleLabel}
          </Text>
        )}
      </View>
    </View>
  );
}
