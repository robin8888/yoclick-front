import { View } from 'react-native';

import type { CenterReportResponseDtoServicesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatReportPercent } from '../model/report-view';
import {
  BAR_ROW_HEADER_STYLE,
  createBarFillStyle,
  createBarGapStyle,
  createBarTrackStyle,
  createReportCardStyle,
} from './ReportCard.styles';

const LOW_OCCUPANCY_PERCENT = 60;

function OccupancyBar({
  service,
}: Readonly<{ service: CenterReportResponseDtoServicesItem }>): React.JSX.Element {
  const theme = useTheme();
  const valueText = formatReportPercent(service.occupancyPercent);

  return (
    <View accessible accessibilityLabel={`${service.name}: ${valueText}`}>
      <View style={BAR_ROW_HEADER_STYLE}>
        <Text variant="body">{service.name}</Text>
        <Text variant="bodyStrong">{valueText}</Text>
      </View>
      <View style={createBarTrackStyle(theme)}>
        <View style={createBarFillStyle(theme, service.occupancyPercent ?? 0)} />
        <View style={createBarGapStyle(service.occupancyPercent ?? 0)} />
      </View>
    </View>
  );
}

/** Prototipo `areports`, «Ocupación por servicio»: del más al menos ocupado. */
export function ServiceOccupancyCard({
  services,
}: Readonly<{ services: readonly CenterReportResponseDtoServicesItem[] }>): React.JSX.Element {
  const theme = useTheme();
  const hasLowOccupancy = services.some(
    ({ occupancyPercent }) => occupancyPercent !== null && occupancyPercent < LOW_OCCUPANCY_PERCENT,
  );

  return (
    <View style={createReportCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('centerAdmin.reports.occupancyByServiceTitle')}
      </Text>
      {services.length === 0 ? (
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.reports.emptyPeriod')}
        </Text>
      ) : (
        services.map((service) => <OccupancyBar key={service.serviceId} service={service} />)
      )}
      {hasLowOccupancy ? (
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.reports.occupancyLowNote')}
        </Text>
      ) : null}
    </View>
  );
}
