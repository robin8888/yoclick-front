import { useState } from 'react';

import { i18n } from '@/shared/i18n';

import { buildTimeReportHtml, type TimeReportInput } from '../model/build-time-report-html';

const PDF_MIME_TYPE = 'application/pdf';
const PDF_UTI = 'com.adobe.pdf';

/**
 * Los módulos nativos se cargan al pedir el informe y no al abrir la pantalla: en una app de
 * desarrollo anterior a `expo-print`, «Mi asistencia» sigue funcionando y solo el PDF avisa.
 */
async function createAndSharePdf(html: string): Promise<void> {
  /* eslint-disable @typescript-eslint/no-require-imports -- carga diferida a propósito (arriba) */
  const Print = require('expo-print') as typeof import('expo-print');
  const Sharing = require('expo-sharing') as typeof import('expo-sharing');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: PDF_MIME_TYPE,
    UTI: PDF_UTI,
    dialogTitle: i18n.t('timeClock.report.shareDialogTitle'),
  });
}

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
    createAndSharePdf(buildTimeReportHtml(input))
      .catch(() => {
        setErrorMessage(i18n.t('timeClock.report.errorMessage'));
      })
      .finally(() => {
        setIsSharing(false);
      });
  };

  return { shareReport, isSharing, errorMessage };
}
