import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme, type CenterAppearance } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import {
  buildBackgroundKindChange,
  isAppearanceColorInvalid,
  resolveBackgroundKind,
  type BackgroundKind,
} from '../model/appearance-draft';
import { BrandCustomColorPanel } from './BrandCustomColorPanel';
import { createPremiumFieldStyle } from './PremiumAppearanceSection.styles';

interface BackgroundAppearanceFieldProps {
  appearance: CenterAppearance;
  onAppearanceChange: (changes: Partial<CenterAppearance>) => void;
}

function BackgroundColorPanels({
  appearance,
  onAppearanceChange,
}: Readonly<BackgroundAppearanceFieldProps>): React.JSX.Element {
  const { backgroundColor, backgroundColorEnd } = appearance;
  const isGradient = backgroundColorEnd !== null;
  const startKeyPrefix = isGradient ? 'gradientStart' : 'solid';

  return (
    <>
      {backgroundColor === null ? null : (
        <BrandCustomColorPanel
          selectedColor={backgroundColor}
          hasColorProblem={isAppearanceColorInvalid(backgroundColor)}
          onColorChange={(color) => {
            onAppearanceChange({ backgroundColor: color });
          }}
          pickerLabel={i18n.t(`branding.premium.background.${startKeyPrefix}PickerLabel`)}
          fieldLabel={i18n.t(`branding.premium.background.${startKeyPrefix}FieldLabel`)}
        />
      )}
      {isGradient ? (
        <BrandCustomColorPanel
          selectedColor={backgroundColorEnd}
          hasColorProblem={isAppearanceColorInvalid(backgroundColorEnd)}
          onColorChange={(color) => {
            onAppearanceChange({ backgroundColorEnd: color });
          }}
          pickerLabel={i18n.t('branding.premium.background.gradientEndPickerLabel')}
          fieldLabel={i18n.t('branding.premium.background.gradientEndFieldLabel')}
        />
      ) : null}
    </>
  );
}

/** «Fondo de las pantallas»: el del tema, un color liso o un degradado de arriba abajo. */
export function BackgroundAppearanceField({
  appearance,
  onAppearanceChange,
}: Readonly<BackgroundAppearanceFieldProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createPremiumFieldStyle(theme)}>
      <Text variant="bodyStrong">{i18n.t('branding.premium.background.title')}</Text>
      <SegmentedControl<BackgroundKind>
        options={[
          { value: 'theme', label: i18n.t('branding.premium.background.theme') },
          { value: 'solid', label: i18n.t('branding.premium.background.solid') },
          { value: 'gradient', label: i18n.t('branding.premium.background.gradient') },
        ]}
        selectedValue={resolveBackgroundKind(appearance)}
        onValueChange={(nextKind) => {
          onAppearanceChange(
            buildBackgroundKindChange(nextKind, appearance, {
              start: theme.colors.bg,
              end: theme.colors.brandSoft,
            }),
          );
        }}
      />
      <BackgroundColorPanels appearance={appearance} onAppearanceChange={onAppearanceChange} />
    </View>
  );
}
