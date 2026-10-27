import { View } from 'react-native';

import { formatStorageSize } from '@/features/videos';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { listNewFeatures, type PlanOffer } from '../model/plan-offers';

const INCLUDED_LIST_STYLE = { gap: 4 } as const;
const CORE_KEYS = ['bookings', 'attendance', 'passes', 'chat'] as const;

interface PlanIncludesProps {
  plan: PlanOffer;
  /** El plan justo por debajo; `undefined` en el más barato, que enseña lo básico. */
  previousPlan: PlanOffer | undefined;
}

function buildLimitLines(plan: PlanOffer): string[] {
  return [
    plan.maxClients === null
      ? i18n.t('centerAdmin.plans.unlimitedClients')
      : i18n.t('centerAdmin.plans.clientLimit', { count: plan.maxClients }),
    i18n.t('centerAdmin.plans.documentStorage', {
      size: formatStorageSize(plan.documentStorageLimitBytes),
    }),
    plan.videoStorageLimitBytes === null
      ? i18n.t('centerAdmin.plans.noVideo')
      : i18n.t('centerAdmin.plans.videoStorage', {
          size: formatStorageSize(plan.videoStorageLimitBytes),
        }),
  ];
}

function buildFeatureLines(plan: PlanOffer, previousPlan: PlanOffer | undefined): string[] {
  const baseLines =
    previousPlan === undefined
      ? CORE_KEYS.map((key) => i18n.t(`centerAdmin.plans.coreIncludes.${key}`))
      : [];
  const newFeatureLines = listNewFeatures(plan, previousPlan).map((feature) =>
    i18n.t(`centerAdmin.plans.features.${feature}`),
  );
  return [...baseLines, ...newFeatureLines];
}

/** Qué da un plan: lo que suma al de debajo, y sus topes de clientes y de espacio. */
export function PlanIncludes({
  plan,
  previousPlan,
}: Readonly<PlanIncludesProps>): React.JSX.Element {
  const heading =
    previousPlan === undefined
      ? i18n.t('centerAdmin.plans.includesTitle')
      : i18n.t('centerAdmin.plans.includesEverythingOf', { name: previousPlan.name });

  return (
    <View style={INCLUDED_LIST_STYLE}>
      <Text variant="bodyStrong">{heading}</Text>
      {[...buildFeatureLines(plan, previousPlan), ...buildLimitLines(plan)].map((line) => (
        <Text key={line}>{`• ${line}`}</Text>
      ))}
    </View>
  );
}
