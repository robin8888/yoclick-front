const SERIAL_LENGTH = 6;

/** Número de serie decorativo del billete: los últimos caracteres del id, en mayúsculas. */
export function buildBanknoteSerial(passId: string): string {
  const compactId = passId.replaceAll('-', '');
  return `Nº ${compactId.slice(-SERIAL_LENGTH).toUpperCase()}`;
}
