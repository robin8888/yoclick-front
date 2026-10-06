/** Cuánto puede quedarse la clave en el portapapeles: el tiempo de pegarla en otra app. */
export const TOTP_SECRET_CLIPBOARD_LIFETIME_MS = 60_000;

/** Lo que se copia: la clave sin espacios (los gestores no aceptan los grupos de 4). */
export function buildCopyableTotpSecret(secret: string): string {
  return secret.replace(/\s/g, '').toUpperCase();
}

/**
 * Solo se borra el portapapeles si aún contiene la clave: si la persona copió otra cosa después,
 * no se le pisa.
 */
export function shouldClearClipboard(clipboardText: string, copiedSecret: string): boolean {
  return clipboardText === copiedSecret;
}
