import { Image } from 'expo-image';
import { View } from 'react-native';

import { buildTheme, useTheme } from '@/shared/theme';
import { getInitials } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import { createLogoPreviewStyle, LOGO_PREVIEW_IMAGE_STYLE } from './CenterLogoPreview.styles';

interface CenterLogoPreviewProps {
  centerName: string;
  brandHexColor: string;
  /** Imagen elegida; sin ella se muestran las iniciales sobre el color de la marca. */
  logoUri: string | null;
  accessibilityLabel: string;
}

/** Cómo se verá el centro: el logo elegido o, mientras no hay, sus iniciales sobre su color. */
export function CenterLogoPreview({
  centerName,
  brandHexColor,
  logoUri,
  accessibilityLabel,
}: Readonly<CenterLogoPreviewProps>): React.JSX.Element {
  const theme = useTheme();
  const initialsColor = buildTheme({ mode: theme.mode, brandHexColor }).colors.onBrand;

  return (
    <View
      accessible
      role="img"
      aria-label={accessibilityLabel}
      style={createLogoPreviewStyle(theme, brandHexColor)}
    >
      {logoUri === null ? (
        <Text variant="display" tintColor={initialsColor} aria-hidden>
          {getInitials(centerName)}
        </Text>
      ) : (
        <Image source={{ uri: logoUri }} contentFit="cover" style={LOGO_PREVIEW_IMAGE_STYLE} />
      )}
    </View>
  );
}
