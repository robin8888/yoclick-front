import { View } from 'react-native';

import type { PlatformOverviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createDistributionCardStyle } from './StatusDistribution.styles';
import {
  createSectorFillStyle,
  SECTOR_LABEL_ROW_STYLE,
  SECTOR_ROW_STYLE,
  createSectorTrackStyle,
} from './SectorBars.styles';

interface SectorBarsProps {
  sectors: PlatformOverviewResponseDto['centersBySector'];
}

/** Los centros por tipo de negocio, de más a menos, con una barra proporcional al mayor. */
export function SectorBars({ sectors }: Readonly<SectorBarsProps>): React.JSX.Element {
  const theme = useTheme();
  const highest = Math.max(1, ...sectors.map(({ count }) => count));

  return (
    <View style={createDistributionCardStyle(theme)}>
      <Text variant="bodyStrong">{i18n.t('platform.overview.sectorsTitle')}</Text>
      {sectors.map(({ sectorId, count }) => {
        const sectorLabel = i18n.t(`onboarding.sectors.${sectorId as 'gym'}`);
        return (
          <View
            key={sectorId}
            style={SECTOR_ROW_STYLE}
            accessible
            accessibilityLabel={`${sectorLabel}: ${String(count)}`}
          >
            <View style={SECTOR_LABEL_ROW_STYLE}>
              <Text color="ink2">{sectorLabel}</Text>
              <Text variant="bodyStrong">{String(count)}</Text>
            </View>
            <View style={createSectorTrackStyle(theme)}>
              <View style={createSectorFillStyle(theme, count / highest)} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
