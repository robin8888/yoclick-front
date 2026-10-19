import { useState } from 'react';

import type { ReceiptResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { createAndSharePdf } from '@/shared/lib/share-pdf';

import { buildReceiptHtml } from '../model/build-receipt-html';

interface ShareReceipt {
  shareReceipt: (receipt: ReceiptResponseDto) => void;
  isSharing: boolean;
  errorMessage: string | null;
}

/** Crea el PDF del recibo y abre la hoja de compartir del móvil (correo, WhatsApp…). */
export function useShareReceipt(timeZone: string): ShareReceipt {
  const [isSharing, setIsSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shareReceipt = (receipt: ReceiptResponseDto): void => {
    if (isSharing) return;
    setIsSharing(true);
    setErrorMessage(null);
    createAndSharePdf({
      html: buildReceiptHtml(receipt, timeZone),
      dialogTitle: i18n.t('receipts.shareDialogTitle'),
    })
      .catch(() => {
        setErrorMessage(i18n.t('receipts.shareError'));
      })
      .finally(() => {
        setIsSharing(false);
      });
  };

  return { shareReceipt, isSharing, errorMessage };
}
