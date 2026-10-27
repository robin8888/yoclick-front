import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import type { UpdatePlatformChargeRequestDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import type { PlatformCharge } from '../model/charge-labels';
import { useUpdateCharge } from './useUpdateCharge';

interface ChargeEditForm {
  invoiceReference: string;
  editInvoiceReference: (text: string) => void;
  /** Anular no se puede deshacer: la primera pulsación solo lo arma y la segunda lo confirma. */
  isVoidArmed: boolean;
  saveInvoiceReference: () => void;
  markAsPaid: () => void;
  voidCharge: () => void;
  isSaving: boolean;
  saveErrorMessage: string | null;
  clearSaveError: () => void;
}

/** El formulario de edición de un cobro: referencia de factura, cobrarlo si estaba pendiente o anularlo. */
export function useChargeEditForm(charge: PlatformCharge, onDone: () => void): ChargeEditForm {
  const [invoiceReference, setInvoiceReference] = useState(charge.invoiceReference ?? '');
  const [isVoidArmed, setIsVoidArmed] = useState(false);
  const update = useUpdateCharge();

  const send = (changes: UpdatePlatformChargeRequestDto): void => {
    update.updateCharge({ chargeId: charge.id, changes }, () => {
      AccessibilityInfo.announceForAccessibility(i18n.t('platform.charges.saved'));
      onDone();
    });
  };

  return {
    invoiceReference,
    editInvoiceReference: setInvoiceReference,
    isVoidArmed,
    saveInvoiceReference: () => {
      const trimmedReference = invoiceReference.trim();
      send({ invoiceReference: trimmedReference === '' ? null : trimmedReference });
    },
    markAsPaid: () => {
      send({ status: 'paid' });
    },
    voidCharge: () => {
      if (!isVoidArmed) {
        setIsVoidArmed(true);
        return;
      }
      send({ status: 'void' });
    },
    isSaving: update.isUpdating,
    saveErrorMessage: update.updateErrorMessage,
    clearSaveError: update.clearError,
  };
}
