const BYTES_PER_MEGABYTE = 1_048_576;
const MAX_PDF_SIZE_MEGABYTES = 50;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MEGABYTES * BYTES_PER_MEGABYTE;

/** Un PDF de 50 MB por una conexión móvil lenta tarda más que cualquier otra petición de la app. */
export const PDF_UPLOAD_TIMEOUT_MS = 180_000;

const MAX_TITLE_LENGTH = 120;
const PDF_EXTENSION = /\.pdf$/i;

export function isPdfTooLarge(sizeBytes: number): boolean {
  return sizeBytes > MAX_PDF_SIZE_BYTES;
}

/** El título que se propone para un PDF subido: su nombre de fichero, sin la extensión. */
export function buildDocumentTitle(fileName: string): string {
  const trimmedName = fileName.trim();
  const title = trimmedName.replace(PDF_EXTENSION, '').trim();
  return (title || trimmedName).slice(0, MAX_TITLE_LENGTH);
}
