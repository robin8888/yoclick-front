import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { ThemeProvider, useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { LiveAppPreview } from './LiveAppPreview';
import { PREVIEW_PANEL_STYLE, PREVIEW_TEXT_STYLE } from './BrandPreviewPanel.styles';

interface BrandPreviewPanelProps {
  centerName: string;
  centerLogoUrl: string | null;
  brandHexColor: string;
}

/** Prototipo `abrand`: la miniatura de la app y, al lado, qué es y qué color se está probando. */
export function BrandPreviewPanel({
  centerName,
  centerLogoUrl,
  brandHexColor,
}: Readonly<BrandPreviewPanelProps>): React.JSX.Element {
  const outerTheme = useTheme();

  return (
    <View style={PREVIEW_PANEL_STYLE}>
      <LiveAppPreview
        centerName={centerName}
        centerLogoUrl={centerLogoUrl}
        brandHexColor={brandHexColor}
      />
      <View style={PREVIEW_TEXT_STYLE}>
        <Text variant="overline" color="ink2">
          {i18n.t('branding.preview.title')}
        </Text>
        <Text variant="caption" color="ink2">
          {i18n.t('branding.preview.helper')}
        </Text>
        <ThemeProvider brandHexColor={brandHexColor} initialPreference={outerTheme.mode}>
          <Badge label={brandHexColor.toUpperCase()} tone="brand" />
        </ThemeProvider>
      </View>
    </View>
  );
}
