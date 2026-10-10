import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme, type CenterAppearance } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { BackgroundAppearanceField } from './BackgroundAppearanceField';
import { HiveAppearanceField } from './HiveAppearanceField';
import { createPremiumSectionStyle, PREMIUM_HEADER_STYLE } from './PremiumAppearanceSection.styles';

interface PremiumAppearanceSectionProps {
  appearance: CenterAppearance;
  canCustomize: boolean;
  onAppearanceChange: (changes: Partial<CenterAppearance>) => void;
}

/** «Personalización Premium»: fondo liso o degradado y color de la colmena; el texto no se toca. */
export function PremiumAppearanceSection({
  appearance,
  canCustomize,
  onAppearanceChange,
}: Readonly<PremiumAppearanceSectionProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createPremiumSectionStyle(theme)}>
      <View style={PREMIUM_HEADER_STYLE}>
        <Text variant="titleMd" role="heading">
          {i18n.t('branding.premium.title')}
        </Text>
        <Badge label={i18n.t('branding.premium.badge')} tone="brand" />
      </View>
      {canCustomize ? (
        <>
          <BackgroundAppearanceField
            appearance={appearance}
            onAppearanceChange={onAppearanceChange}
          />
          <HiveAppearanceField
            hiveColor={appearance.hiveColor}
            onHiveColorChange={(hiveColor) => {
              onAppearanceChange({ hiveColor });
            }}
          />
          <Text variant="caption" color="ink2">
            {i18n.t('branding.premium.textNote')}
          </Text>
        </>
      ) : (
        <Text color="ink2">{i18n.t('branding.premium.lockedMessage')}</Text>
      )}
    </View>
  );
}
