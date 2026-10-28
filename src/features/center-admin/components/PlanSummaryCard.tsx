import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { CenterSubscriptionResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { calculateTrialRemainingPercent, countTrialDaysLeft } from '../model/subscription-plan';
import {
  createPlanSummaryHeaderStyle,
  createPlanSummaryStyle,
  createPlanSummaryTextRowStyle,
} from './PlanSummaryCard.styles';
import { createBarFillStyle, createBarGapStyle, createBarTrackStyle } from './ReportCard.styles';
import { STATUS_TONES } from './SubscriptionSummaryCard';

const SUBSCRIPTION_ROUTE = '/(admin)/subscription';

interface PlanDescription {
  title: string;
  detail: string | null;
  /** Lo que queda de prueba, de 0 a 100; `null` si no está en prueba. */
  trialRemainingPercent: number | null;
}

function describeTrialDetail(daysLeft: number | null): string | null {
  if (daysLeft === null) return null;
  if (daysLeft === 0) return i18n.t('centerAdmin.subscription.trialEnded');
  return i18n.t('centerAdmin.subscription.trialDaysLeft', { count: daysLeft });
}

/** Mientras dura la prueba el centro aún no tiene plan contratado: se dice «En prueba», no el plan asignado. */
function describePlan(subscription: CenterSubscriptionResponseDto): PlanDescription {
  if (subscription.status !== 'trial') {
    return {
      title: i18n.t('centerAdmin.subscription.homePlan', {
        plan: i18n.t(`centerAdmin.subscription.plans.${subscription.planId}`),
      }),
      detail: null,
      trialRemainingPercent: null,
    };
  }
  const daysLeft = countTrialDaysLeft(subscription.trialEndsAt, new Date());
  return {
    title: i18n.t('centerAdmin.subscription.homeInTrial'),
    detail: describeTrialDetail(daysLeft),
    trialRemainingPercent: calculateTrialRemainingPercent(daysLeft),
  };
}

function TrialRemainingBar({ percent }: Readonly<{ percent: number }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createBarTrackStyle(theme)}>
      <View style={createBarFillStyle(theme, percent)} />
      <View style={createBarGapStyle(percent)} />
    </View>
  );
}

function PlanSummaryText({
  title,
  detail,
}: Readonly<{ title: string; detail: string | null }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createPlanSummaryTextRowStyle(theme)}>
      <Text variant="titleMd">{title}</Text>
      {detail === null ? null : (
        <Text variant="caption" color="ink2">
          {detail}
        </Text>
      )}
    </View>
  );
}

function PlanSummaryBody({
  subscription,
}: Readonly<{ subscription: CenterSubscriptionResponseDto }>): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();
  const style = usePressableStyle({
    baseStyle: createPlanSummaryStyle(theme),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });
  const { title, detail, trialRemainingPercent } = describePlan(subscription);
  const statusLabel = i18n.t(`centerAdmin.subscription.statuses.${subscription.status}`);
  const label = i18n.t('centerAdmin.subscription.homeLabel', {
    title,
    detail: detail ?? statusLabel,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={() => {
        router.push(SUBSCRIPTION_ROUTE);
      }}
      style={style}
    >
      <View style={createPlanSummaryHeaderStyle()}>
        <Badge label={statusLabel} tone={STATUS_TONES[subscription.status]} />
        <Icon name="chevronRight" color="ink2" />
      </View>
      <PlanSummaryText title={title} detail={detail} />
      {trialRemainingPercent === null ? null : (
        <TrialRemainingBar percent={trialRemainingPercent} />
      )}
    </Pressable>
  );
}

/**
 * El plan del centro en su inicio: la pastilla de estado arriba a la izquierda, «En prueba» con los días que
 * quedan en una línea y una barra de lo que resta, o el plan contratado. Lleva a «Mi suscripción». Mientras
 * carga o si no se puede leer, no ocupa sitio.
 */
export function PlanSummaryCard(): React.JSX.Element | null {
  const subscription = useCenterSubscription();
  if (subscription.data === undefined) return null;
  return <PlanSummaryBody subscription={subscription.data} />;
}
