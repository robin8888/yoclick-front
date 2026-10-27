import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';
import { BottomSheet } from '@/ui/organisms/BottomSheet';
import { ProblemModal } from '@/ui/organisms/ProblemModal';

import { useChargeEditForm } from '../hooks/useChargeEditForm';
import type { PlatformCharge } from '../model/charge-labels';

interface ChargeEditSheetProps {
  /** El cobro que se edita; `null` mantiene la hoja cerrada. */
  charge: PlatformCharge | null;
  onDismiss: () => void;
}

type EditForm = ReturnType<typeof useChargeEditForm>;

function SecondaryChargeActions({
  form,
  status,
}: Readonly<{ form: EditForm; status: PlatformCharge['status'] }>): React.JSX.Element {
  return (
    <>
      {status === 'pending' ? (
        <Button
          variant="outline"
          label={i18n.t('platform.charges.markPaid')}
          isFullWidth
          isDisabled={form.isSaving}
          onPress={form.markAsPaid}
        />
      ) : null}
      {form.isVoidArmed ? (
        <Text color="danger">{i18n.t('platform.charges.voidWarning')}</Text>
      ) : null}
      <Button
        variant="ghostDanger"
        label={i18n.t('platform.charges.voidCharge')}
        isFullWidth
        isDisabled={form.isSaving}
        onPress={form.voidCharge}
      />
    </>
  );
}

function ChargeEditForm({
  charge,
  onDone,
}: Readonly<{ charge: PlatformCharge; onDone: () => void }>): React.JSX.Element {
  const form = useChargeEditForm(charge, onDone);

  return (
    <>
      <FormField
        label={i18n.t('platform.charges.invoiceLabel')}
        helperText={i18n.t('platform.charges.invoiceHelper')}
        value={form.invoiceReference}
        onChangeText={form.editInvoiceReference}
        autoCapitalize="characters"
      />
      <Button
        label={i18n.t('platform.charges.save')}
        isFullWidth
        isLoading={form.isSaving}
        onPress={form.saveInvoiceReference}
      />
      <SecondaryChargeActions form={form} status={charge.status} />
      <ProblemModal
        message={form.saveErrorMessage}
        onDismiss={form.clearSaveError}
        {...getProblemModalCopy()}
      />
    </>
  );
}

/** Hoja para poner la referencia de factura de un cobro, cobrarlo si estaba pendiente o anularlo. */
export function ChargeEditSheet({
  charge,
  onDismiss,
}: Readonly<ChargeEditSheetProps>): React.JSX.Element {
  return (
    <BottomSheet
      isVisible={charge !== null}
      title={i18n.t('platform.charges.editTitle')}
      onDismiss={onDismiss}
    >
      {charge === null ? null : (
        <ChargeEditForm key={charge.id} charge={charge} onDone={onDismiss} />
      )}
    </BottomSheet>
  );
}
