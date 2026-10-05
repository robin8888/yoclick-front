import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { ThemeProvider, useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { createPreviewCardStyle, PREVIEW_HEADER_STYLE } from './CenterBrandPreview.styles';

// El botón de la vista previa solo enseña el color: no hace nada al pulsarlo.
function ignorePreviewPress(): void {
  return undefined;
}

interface CenterBrandPreviewProps {
  centerName: string;
  brandHexColor: string;
}

function BrandedPreviewContent({
  centerName,
}: Readonly<Pick<CenterBrandPreviewProps, 'centerName'>>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createPreviewCardStyle(theme)}>
      <View style={PREVIEW_HEADER_STYLE}>
        <Avatar name={centerName} size="lg" isDecorative />
        <Text variant="titleMd">{centerName}</Text>
      </View>
      <Button
        label={i18n.t('onboarding.center.previewButton')}
        isFullWidth
        onPress={ignorePreviewPress}
      />
    </View>
  );
}

/** Muestra el botón y el avatar con la marca elegida: un tema anidado solo para la vista previa. */
export function CenterBrandPreview({
  centerName,
  brandHexColor,
}: Readonly<CenterBrandPreviewProps>): React.JSX.Element {
  return (
    <ThemeProvider brandHexColor={brandHexColor}>
      <BrandedPreviewContent centerName={centerName} />
    </ThemeProvider>
  );
}
