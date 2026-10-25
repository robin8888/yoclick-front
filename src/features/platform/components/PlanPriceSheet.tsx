import type { PlatformPlanListResponseDtoPlansItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { Button } from '@/ui/atoms/Button';
import { FormField } from '@/ui/molecules/FormField';
import { BottomSheet } from '@/ui/organisms/BottomSheet';
import { ProblemModal } from '@/ui/organisms/ProblemModal';

import { usePlanPriceForm } from '../hooks/usePlanPriceForm';
import { getPlanName } from '../model/plan-labels';
import type { PlanPriceFieldError } from '../model/plan-price-form';

type Plan = PlatformPlanListResponseDtoPlansItem;

interface PlanPriceSheetProps {
  /** El plan que se edita; `null` mantiene la hoja cerrada. */
  plan: Plan | null;
  onDismiss: () => void;
}

function describeError(error: PlanPriceFieldError | null): string | undefined {
  if (error === null) return undefined;
  return error === 'invalid'
    ? i18n.t('platform.plans.priceInvalid')
    : i18n.t('platform.plans.annualAboveMonthly');
}

function SaveControls({
  form,
}: Readonly<{ form: ReturnType<typeof usePlanPriceForm> }>): React.JSX.Element {
  return (
    <>
      <Button
        label={i18n.t('platform.plans.savePrices')}
        isFullWidth
        isLoading={form.isSaving}
        onPress={form.save}
      />
      <ProblemModal
        message={form.saveErrorMessage}
        onDismiss={form.clearSaveError}
        {...getProblemModalCopy()}
      />
    </>
  );
}

function PlanPriceForm({
  plan,
  onSaved,
}: Readonly<{ plan: Plan; onSaved: () => void }>): React.JSX.Element {
  const form = usePlanPriceForm(plan, onSaved);

  return (
    <>
      <FormField
        label={i18n.t('platform.plans.monthlyLabel')}
        value={form.draft.monthly}
        onChangeText={form.editField('monthly')}
        keyboardType="decimal-pad"
        errorMessage={form.error === 'invalid' ? describeError(form.error) : undefined}
      />
      <FormField
        label={i18n.t('platform.plans.annualLabel')}
        value={form.draft.annualMonthly}
        onChangeText={form.editField('annualMonthly')}
        keyboardType="decimal-pad"
        errorMessage={form.error === 'annualAboveMonthly' ? describeError(form.error) : undefined}
      />
      <FormField
        label={i18n.t('platform.plans.setupFeeLabel')}
        helperText={i18n.t('platform.plans.setupFeeHelper')}
        value={form.draft.setupFee}
        onChangeText={form.editField('setupFee')}
        keyboardType="decimal-pad"
      />
      <SaveControls form={form} />
    </>
  );
}

/** Hoja para cambiar el precio mensual, el anual y la cuota de alta de un plan (importes sin IVA). */
export function PlanPriceSheet({
  plan,
  onDismiss,
}: Readonly<PlanPriceSheetProps>): React.JSX.Element {
  return (
    <BottomSheet
      isVisible={plan !== null}
      title={
        plan === null ? '' : i18n.t('platform.plans.editTitle', { name: getPlanName(plan.id) })
      }
      onDismiss={onDismiss}
    >
      {plan === null ? null : <PlanPriceForm key={plan.id} plan={plan} onSaved={onDismiss} />}
    </BottomSheet>
  );
}
