import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { Button } from '@/ui/atoms/Button';
import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';
import { BottomSheet } from '@/ui/organisms/BottomSheet';
import { ProblemModal } from '@/ui/organisms/ProblemModal';

import { useChargeForm } from '../hooks/useChargeForm';
import type { ChargeFieldError, ChargePaymentMethod } from '../model/charge-form';
import { getPaymentMethodLabel } from '../model/charge-labels';
import type { PlanId } from '../model/plan-labels';

const PAYMENT_METHODS: readonly ChargePaymentMethod[] = ['transfer', 'card', 'cash', 'other'];
const METHOD_CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

export interface ChargeSheetCenter {
  id: string;
  name: string;
  planId: PlanId;
}

interface ChargeFormSheetProps {
  center: ChargeSheetCenter;
  isVisible: boolean;
  onDismiss: () => void;
}

type Form = ReturnType<typeof useChargeForm>;

function describeError(
  field: ChargeFieldError,
  error: ChargeFieldError | null,
): string | undefined {
  if (error !== field) return undefined;
  if (field === 'concept') return i18n.t('platform.charges.conceptError');
  if (field === 'baseAmount') return i18n.t('platform.charges.baseError');
  return i18n.t('platform.charges.vatError');
}

function PaymentMethodChips({
  selectedMethod,
  onMethodSelect,
}: Readonly<{
  selectedMethod: ChargePaymentMethod;
  onMethodSelect: (method: ChargePaymentMethod) => void;
}>): React.JSX.Element {
  return (
    <View accessibilityRole="radiogroup" style={METHOD_CHIPS_STYLE}>
      {PAYMENT_METHODS.map((method) => (
        <Chip
          key={method}
          label={getPaymentMethodLabel(method)}
          isSelected={method === selectedMethod}
          selectionRole="radio"
          onPress={() => {
            onMethodSelect(method);
          }}
        />
      ))}
    </View>
  );
}

function AmountFields({ form }: Readonly<{ form: Form }>): React.JSX.Element {
  return (
    <>
      <FormField
        label={i18n.t('platform.charges.conceptLabel')}
        value={form.draft.concept}
        onChangeText={form.editField('concept')}
        errorMessage={describeError('concept', form.error)}
      />
      <FormField
        label={i18n.t('platform.charges.baseLabel')}
        value={form.draft.baseAmount}
        onChangeText={form.editField('baseAmount')}
        keyboardType="decimal-pad"
        errorMessage={describeError('baseAmount', form.error)}
      />
      <FormField
        label={i18n.t('platform.charges.vatLabel')}
        value={form.draft.vatRate}
        onChangeText={form.editField('vatRate')}
        keyboardType="decimal-pad"
        errorMessage={describeError('vatRate', form.error)}
      />
    </>
  );
}

function CustomerFields({ form }: Readonly<{ form: Form }>): React.JSX.Element {
  return (
    <>
      <FormField
        label={i18n.t('platform.charges.legalNameLabel')}
        value={form.draft.customerLegalName}
        onChangeText={form.editField('customerLegalName')}
      />
      <FormField
        label={i18n.t('platform.charges.taxIdLabel')}
        value={form.draft.customerTaxId}
        onChangeText={form.editField('customerTaxId')}
        autoCapitalize="characters"
      />
      <FormField
        label={i18n.t('platform.charges.invoiceLabel')}
        value={form.draft.invoiceReference}
        onChangeText={form.editField('invoiceReference')}
        autoCapitalize="characters"
      />
    </>
  );
}

function ChargeForm({
  center,
  onRecorded,
}: Readonly<{ center: ChargeSheetCenter; onRecorded: () => void }>): React.JSX.Element {
  const form = useChargeForm(center, onRecorded);

  return (
    <>
      <Text color="ink2">{i18n.t('platform.charges.recordNote')}</Text>
      <AmountFields form={form} />
      <Text variant="bodyStrong">{i18n.t('platform.charges.methodLabel')}</Text>
      <PaymentMethodChips
        selectedMethod={form.draft.paymentMethod}
        onMethodSelect={form.editField('paymentMethod')}
      />
      <CustomerFields form={form} />
      <Button
        label={i18n.t('platform.charges.submit')}
        isFullWidth
        isLoading={form.isSubmitting}
        onPress={form.submit}
      />
      <ProblemModal
        message={form.submitErrorMessage}
        onDismiss={form.clearSubmitError}
        {...getProblemModalCopy()}
      />
    </>
  );
}

/** Hoja para apuntar a mano el cobro de un plan a un centro (los primeros pilotos, antes de Stripe). */
export function ChargeFormSheet({
  center,
  isVisible,
  onDismiss,
}: Readonly<ChargeFormSheetProps>): React.JSX.Element {
  return (
    <BottomSheet
      isVisible={isVisible}
      title={i18n.t('platform.charges.recordTitle', { name: center.name })}
      onDismiss={onDismiss}
    >
      {isVisible ? <ChargeForm center={center} onRecorded={onDismiss} /> : null}
    </BottomSheet>
  );
}
