import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import { isAppearanceColorInvalid, type HiveKind } from '../model/appearance-draft';
import { BrandCustomColorPanel } from './BrandCustomColorPanel';
import { createPremiumFieldStyle } from './PremiumAppearanceSection.styles';

interface HiveAppearanceFieldProps {
  hiveColor: string | null;
  onHiveColorChange: (hiveColor: string | null) => void;
}

/** «Color de la colmena»: el de marca o uno propio. */
export function HiveAppearanceField({
  hiveColor,
  onHiveColorChange,
}: Readonly<HiveAppearanceFieldProps>): React.JSX.Element {
  const theme = useTheme();
  const kind: HiveKind = hiveColor === null ? 'brand' : 'custom';

  return (
    <View style={createPremiumFieldStyle(theme)}>
      <Text variant="bodyStrong">{i18n.t('branding.premium.hive.title')}</Text>
      <SegmentedControl<HiveKind>
        options={[
          { value: 'brand', label: i18n.t('branding.premium.hive.brand') },
          { value: 'custom', label: i18n.t('branding.premium.hive.custom') },
        ]}
        selectedValue={kind}
        onValueChange={(nextKind) => {
          onHiveColorChange(nextKind === 'brand' ? null : (hiveColor ?? theme.colors.brand));
        }}
      />
      {hiveColor === null ? null : (
        <BrandCustomColorPanel
          selectedColor={hiveColor}
          hasColorProblem={isAppearanceColorInvalid(hiveColor)}
          onColorChange={onHiveColorChange}
          pickerLabel={i18n.t('branding.premium.hive.pickerLabel')}
          fieldLabel={i18n.t('branding.premium.hive.fieldLabel')}
        />
      )}
    </View>
  );
}
