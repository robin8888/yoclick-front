import { View } from 'react-native';

import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { calculateClientUsagePercent } from '../model/subscription-plan';
import {
  BAR_ROW_HEADER_STYLE,
  createBarFillStyle,
  createBarGapStyle,
  createBarTrackStyle,
  createReportCardStyle,
} from './ReportCard.styles';

interface ClientUsageCardProps {
  subscription: CenterSubscriptionResponseDto;
  clientWord: string;
}

/** Prototipo `asubs`, «Clientes activos»: cuántos hay y cuánto del tope del plan se usa. */
export function ClientUsageCard({
  subscription,
  clientWord,
}: Readonly<ClientUsageCardProps>): React.JSX.Element {
  const theme = useTheme();
  const { activeClientCount, maxClients } = subscription;
  const usagePercent = calculateClientUsagePercent(activeClientCount, maxClients);
  const usageText =
    maxClients === null
      ? i18n.t('centerAdmin.subscription.usageUnlimited', { count: activeClientCount })
      : i18n.t('centerAdmin.subscription.usageOutOf', {
          count: activeClientCount,
          limit: maxClients,
        });
  const isOverLimit = maxClients !== null && activeClientCount > maxClients;

  return (
    <View style={createReportCardStyle(theme)}>
      <View accessible accessibilityLabel={`${clientWord}: ${usageText}`}>
        <View style={BAR_ROW_HEADER_STYLE}>
          <Text variant="body">
            {i18n.t('centerAdmin.subscription.usageTitle', { clientWord })}
          </Text>
          <Text variant="bodyStrong">{usageText}</Text>
        </View>
        {usagePercent === null ? null : (
          <View style={createBarTrackStyle(theme)}>
            <View style={createBarFillStyle(theme, usagePercent)} />
            <View style={createBarGapStyle(usagePercent)} />
          </View>
        )}
      </View>
      {isOverLimit ? (
        <Text variant="caption" color="warning">
          {i18n.t('centerAdmin.subscription.usageOverLimit')}
        </Text>
      ) : null}
    </View>
  );
}
