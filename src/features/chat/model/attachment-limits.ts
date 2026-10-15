const BYTES_PER_MEGABYTE = 1_048_576;
const MAX_PDF_SIZE_MEGABYTES = 10;
export const MAX_PDF_ATTACHMENT_BYTES = MAX_PDF_SIZE_MEGABYTES * BYTES_PER_MEGABYTE;

/** Una subida por datos móviles lentos tarda más que una petición normal. */
export const ATTACHMENT_UPLOAD_TIMEOUT_MS = 90_000;

/** Los PDF caben hasta 10 MB; las fotos las reduce la app antes de subirlas. */
export function isPdfAttachmentTooLarge(sizeBytes: number): boolean {
  return sizeBytes > MAX_PDF_ATTACHMENT_BYTES;
}
