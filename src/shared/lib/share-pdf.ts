const PDF_MIME_TYPE = 'application/pdf';
const PDF_UTI = 'com.adobe.pdf';

/**
 * Crea un PDF desde HTML y abre la hoja de compartir del móvil. Los módulos nativos se cargan al
 * pedirlo y no al abrir la pantalla: en una app de desarrollo anterior a `expo-print`, lo demás
 * sigue funcionando y solo el PDF avisa. El archivo queda en la caché temporal del sistema.
 */
export async function createAndSharePdf(input: {
  html: string;
  dialogTitle: string;
}): Promise<void> {
  /* eslint-disable @typescript-eslint/no-require-imports -- carga diferida a propósito (arriba) */
  const Print = require('expo-print') as typeof import('expo-print');
  const Sharing = require('expo-sharing') as typeof import('expo-sharing');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const { uri } = await Print.printToFileAsync({ html: input.html });
  await Sharing.shareAsync(uri, {
    mimeType: PDF_MIME_TYPE,
    UTI: PDF_UTI,
    dialogTitle: input.dialogTitle,
  });
}
