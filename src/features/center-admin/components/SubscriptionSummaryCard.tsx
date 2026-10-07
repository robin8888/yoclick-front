import { View } from 'react-native';

import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { countTrialDaysLeft, resolveSubscriptionPlan } from '../model/subscription-plan';
import { createReportCardStyle, REPORT_HEADER_ROW_STYLE } from './ReportCard.styles';

const STATUS_TONES: Record<CenterSubscriptionResponseDto['status'], BadgeTone> = {
  trial: 'info',
  active: 'success',
  past_due: 'warning',
  suspended: 'danger',
};

function describeTrial(trialEndsAt: string | null, now: Date): string | null {
  const daysLeft = countTrialDaysLeft(trialEndsAt, now);
  if (daysLeft === null) return null;
  return daysLeft === 0
    ? i18n.t('centerAdmin.subscription.trialEnded')
    : i18n.t('centerAdmin.subscription.trialDaysLeft', { count: daysLeft });
}

/** Prototipo `asubs`, «Plan actual»: el plan, su estado y lo que queda de prueba. */
export function SubscriptionSummaryCard({
  subscription,
}: Readonly<{ subscription: CenterSubscriptionResponseDto }>): React.JSX.Element {
  const theme = useTheme();
  const planId = resolveSubscriptionPlan(subscription.maxClients);
  const trialText =
    subscription.status === 'trial' ? describeTrial(subscription.trialEndsAt, new Date()) : null;

  return (
    <View style={createReportCardStyle(theme)}>
      <View style={REPORT_HEADER_ROW_STYLE}>
        <View>
          <Text variant="overline" color="ink2">
            {i18n.t('centerAdmin.subscription.currentPlan')}
          </Text>
          <Text variant="titleLg">{i18n.t(`centerAdmin.subscription.plans.${planId}`)}</Text>
        </View>
        <Badge
          label={i18n.t(`centerAdmin.subscription.statuses.${subscription.status}`)}
          tone={STATUS_TONES[subscription.status]}
        />
      </View>
      {trialText ? <Text variant="body">{trialText}</Text> : null}
    </View>
  );
}
