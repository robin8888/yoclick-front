import { Image } from 'expo-image';
import { View } from 'react-native';

import { getInitials } from '@/ui/atoms/Avatar/get-initials';
import { Text } from '@/ui/atoms/Text';

import { BANKNOTE_WATERMARK_IMAGE_STYLE, BANKNOTE_WATERMARK_STYLE } from './BanknoteCard.styles';
import type { BanknoteWatermark as BanknoteWatermarkData } from './BanknoteCard.types';

/**
 * El logo del centro como marca de agua del billete: grande, tenue y a la derecha, detrás de la
 * roseta. Es decorativa: no la lee el lector de pantalla.
 */
export function BanknoteWatermark({
  centerName,
  logoUrl,
}: Readonly<BanknoteWatermarkData>): React.JSX.Element {
  const hasLogo = typeof logoUrl === 'string' && logoUrl !== '';

  return (
    <View
      style={BANKNOTE_WATERMARK_STYLE}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {hasLogo ? (
        <Image
          source={{ uri: logoUrl }}
          style={BANKNOTE_WATERMARK_IMAGE_STYLE}
          contentFit="contain"
          accessible={false}
        />
      ) : (
        <Text variant="display" color="ink2">
          {getInitials(centerName)}
        </Text>
      )}
    </View>
  );
}
