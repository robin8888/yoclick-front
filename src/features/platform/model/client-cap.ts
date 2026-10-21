const MAX_CLIENT_CAP = 1_000_000;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

export type ClientCapParseResult =
  { readonly isValid: true; readonly value: number | null } | { readonly isValid: false };

/**
 * El tope de clientes escrito a mano: vacío = sin tope; si no, un entero de 0 a 1.000.000 (los mismos
 * límites que valida la API).
 */
export function parseClientCap(text: string): ClientCapParseResult {
  const trimmedText = text.trim();
  if (trimmedText === '') return { isValid: true, value: null };
  if (!WHOLE_NUMBER_PATTERN.test(trimmedText)) return { isValid: false };
  const value = Number(trimmedText);
  return value <= MAX_CLIENT_CAP ? { isValid: true, value } : { isValid: false };
}

/** Cómo se enseña el tope actual en el campo: vacío si no hay. */
export function formatClientCapForInput(maxClients: number | null): string {
  return maxClients === null ? '' : String(maxClients);
}
