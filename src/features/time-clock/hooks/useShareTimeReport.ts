import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';

import { i18n } from '@/shared/i18n';

import { buildTimeReportHtml, type TimeReportInput } from '../model/build-time-report-html';

const PDF_MIME_TYPE = 'application/pdf';
const PDF_UTI = 'com.adobe.pdf';

interface ShareTimeReport {
  shareReport: (input: TimeReportInput) => void;
  isSharing: boolean;
  errorMessage: string | null;
}

/**
 * Crea el PDF del mes y abre la hoja de compartir del móvil (correo, WhatsApp…). El archivo queda
 * en la caché temporal del sistema; no se guarda en ningún otro sitio.
 */
export function useShareTimeReport(): ShareTimeReport {
  const [isSharing, setIsSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shareReport = (input: TimeReportInput): void => {
    if (isSharing) return;
    setIsSharing(true);
    setErrorMessage(null);
    Print.printToFileAsync({ html: buildTimeReportHtml(input) })
      .then(({ uri }) =>
        Sharing.shareAsync(uri, {
          mimeType: PDF_MIME_TYPE,
          UTI: PDF_UTI,
          dialogTitle: i18n.t('timeClock.report.shareDialogTitle'),
        }),
      )
      .catch(() => {
        setErrorMessage(i18n.t('timeClock.report.errorMessage'));
      })
      .finally(() => {
        setIsSharing(false);
      });
  };

  return { shareReport, isSharing, errorMessage };
}
