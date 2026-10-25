import { View } from 'react-native';

import type { PlatformCenterDetailResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';
import { ProblemModal } from '@/ui/organisms/ProblemModal';

import { useCenterPlanChange } from '../hooks/useCenterPlanChange';
import { getPlanName, PLAN_IDS, type PlanId } from '../model/plan-labels';

const PICKER_STYLE = { gap: 12 } as const;
const PLAN_BUTTONS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

interface CenterPlanPickerProps {
  center: PlatformCenterDetailResponseDto;
}

function PlanButton({
  planId,
  isCurrent,
  onPress,
}: Readonly<{ planId: PlanId; isCurrent: boolean; onPress: () => void }>): React.JSX.Element {
  const name = getPlanName(planId);
  const accessibilityLabel = isCurrent
    ? i18n.t('platform.center.currentPlan', { name })
    : i18n.t('platform.center.moveToPlan', { name });

  return (
    <Button
      size="sm"
      variant={isCurrent ? 'primary' : 'outline'}
      label={name}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    />
  );
}

function PlanChangeConfirmation({
  center,
  change,
}: Readonly<{
  center: PlatformCenterDetailResponseDto;
  change: ReturnType<typeof useCenterPlanChange>;
}>): React.JSX.Element {
  const name = change.pendingPlanId === null ? '' : getPlanName(change.pendingPlanId);

  return (
    <>
      <ConfirmSheet
        isVisible={change.pendingPlanId !== null}
        title={i18n.t('platform.center.confirmPlanTitle', { name })}
        message={i18n.t('platform.center.confirmPlanMessage', { center: center.name, name })}
        confirmLabel={i18n.t('platform.center.confirmPlanAction')}
        dismissLabel={i18n.t('platform.center.dismiss')}
        isDestructive={false}
        isConfirming={change.isUpdating}
        loadingLabel={getSharedStateCopy().loadingLabel}
        onConfirm={change.confirmPlan}
        onDismiss={change.cancelPlan}
      />
      <ProblemModal
        message={change.updateErrorMessage}
        onDismiss={change.clearError}
        {...getProblemModalCopy()}
      />
    </>
  );
}

/** Elegir el plan del centro. Cambiarlo le aplica los límites del plan nuevo, por eso se confirma. */
export function CenterPlanPicker({ center }: Readonly<CenterPlanPickerProps>): React.JSX.Element {
  const change = useCenterPlanChange(center.id);

  return (
    <View style={PICKER_STYLE}>
      <Text variant="bodyStrong">{i18n.t('platform.center.planPickerTitle')}</Text>
      <View style={PLAN_BUTTONS_STYLE}>
        {PLAN_IDS.map((planId) => (
          <PlanButton
            key={planId}
            planId={planId}
            isCurrent={planId === center.planId}
            onPress={() => {
              if (planId !== center.planId) change.requestPlan(planId);
            }}
          />
        ))}
      </View>
      <PlanChangeConfirmation center={center} change={change} />
    </View>
  );
}
