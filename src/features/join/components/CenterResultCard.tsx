import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { buildTheme, platformCardColors, useTheme } from '@/shared/theme';
import { getInitials } from '@/ui/atoms/Avatar';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createCenterResultCardStyle,
  createCenterResultTileStyle,
  RESULT_LOGO_STYLE,
  RESULT_TEXT_STYLE,
} from './CenterResultCard.styles';

interface CenterResultCardProps {
  name: string;
  /** Ciudad y, si se conoce, distancia. */
  location: string | undefined;
  brandHexColor: string;
  /** Ruta relativa del logo; sin él se muestran las iniciales. */
  logoUrl: string | null;
  onPress: () => void;
}

/** Un centro de los resultados: tarjeta blanca con sus iniciales sobre el color de su marca. */
export function CenterResultCard({
  name,
  location,
  brandHexColor,
  logoUrl,
  onPress,
}: Readonly<CenterResultCardProps>): React.JSX.Element {
  const theme = useTheme();
  const logoImageUrl = resolveApiAssetUrl(logoUrl);
  const initialsColor = buildTheme({ mode: theme.mode, brandHexColor }).colors.onBrand;

  return (
    <Pressable
      role="button"
      accessibilityLabel={location === undefined ? name : `${name}. ${location}`}
      onPress={onPress}
      style={createCenterResultCardStyle(theme)}
    >
      <View style={createCenterResultTileStyle(theme, brandHexColor)}>
        {logoImageUrl === null ? (
          <Text variant="titleMd" tintColor={initialsColor} aria-hidden>
            {getInitials(name)}
          </Text>
        ) : (
          <Image source={{ uri: logoImageUrl }} contentFit="cover" style={RESULT_LOGO_STYLE} />
        )}
      </View>
      <View style={RESULT_TEXT_STYLE}>
        <Text variant="bodyStrong" tintColor={platformCardColors.title}>
          {name}
        </Text>
        {location === undefined ? null : (
          <Text variant="caption" tintColor={platformCardColors.description}>
            {location}
          </Text>
        )}
      </View>
      <Icon name="chevronRight" size="navigation" tintColor={platformCardColors.icon} />
    </Pressable>
  );
}
