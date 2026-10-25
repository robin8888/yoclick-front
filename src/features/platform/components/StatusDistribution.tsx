import { View } from 'react-native';

import type { PlatformOverviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme, type ThemeColors } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { buildStatusShares, type CenterStatusId } from '../model/status-distribution';
import {
  createDistributionCardStyle,
  createLegendDotStyle,
  createSegmentStyle,
  DISTRIBUTION_TRACK_STYLE,
  LEGEND_LABEL_STYLE,
  LEGEND_ROW_STYLE,
  LEGEND_STYLE,
} from './StatusDistribution.styles';

const STATUS_COLOR_KEYS: Readonly<Record<CenterStatusId, keyof ThemeColors>> = {
  active: 'success',
  trial: 'info',
  past_due: 'warning',
  suspended: 'danger',
};

interface StatusDistributionProps {
  byStatus: PlatformOverviewResponseDto['centers']['byStatus'];
}

/** Cómo se reparten los centros por estado: una barra de tramos y, debajo, cada estado con su cifra. */
export function StatusDistribution({
  byStatus,
}: Readonly<StatusDistributionProps>): React.JSX.Element {
  const theme = useTheme();
  const shares = buildStatusShares(byStatus);

  return (
    <View style={createDistributionCardStyle(theme)}>
      <Text variant="bodyStrong">{i18n.t('platform.overview.statusTitle')}</Text>
      <View style={DISTRIBUTION_TRACK_STYLE} accessibilityElementsHidden>
        {shares
          .filter(({ share }) => share > 0)
          .map(({ statusId, share }) => (
            <View
              key={statusId}
              style={createSegmentStyle(theme.colors[STATUS_COLOR_KEYS[statusId]], share)}
            />
          ))}
      </View>
      <View style={LEGEND_STYLE}>
        {shares.map(({ statusId, count }) => {
          const label = i18n.t(`platform.status.${statusId}`);
          return (
            <View
              key={statusId}
              style={LEGEND_ROW_STYLE}
              accessible
              accessibilityLabel={`${label}: ${String(count)}`}
            >
              <View style={LEGEND_LABEL_STYLE}>
                <View style={createLegendDotStyle(theme.colors[STATUS_COLOR_KEYS[statusId]])} />
                <Text color="ink2">{label}</Text>
              </View>
              <Text variant="bodyStrong">{String(count)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
