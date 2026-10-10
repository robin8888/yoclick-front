import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { getInitials } from '@/ui/atoms/Avatar/get-initials';
import { Text } from '@/ui/atoms/Text';

import { CENTER_LOGO_TILE_IMAGE_STYLE, createCenterLogoTileStyle } from './CenterLogoTile.styles';
import type { CenterLogoTileProps } from './CenterLogoTile.types';

/** El logo del centro como icono de app (bienvenida): imagen sobre su color o, sin logo, las iniciales. */
export function CenterLogoTile({
  centerName,
  logoUrl,
}: Readonly<CenterLogoTileProps>): React.JSX.Element {
  const theme = useTheme();
  const [hasLogoFailed, setHasLogoFailed] = useState(false);
  const shouldShowLogo = typeof logoUrl === 'string' && logoUrl !== '' && !hasLogoFailed;

  return (
    <View role="img" aria-label={centerName} accessible style={createCenterLogoTileStyle(theme)}>
      {shouldShowLogo ? (
        <Image
          source={{ uri: logoUrl }}
          style={CENTER_LOGO_TILE_IMAGE_STYLE}
          contentFit="cover"
          accessible={false}
          onError={() => {
            setHasLogoFailed(true);
          }}
        />
      ) : (
        <Text variant="titleLg" color="onBrand">
          {getInitials(centerName)}
        </Text>
      )}
    </View>
  );
}
