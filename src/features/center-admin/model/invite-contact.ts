const SPAIN_PREFIX = '+34';
const SPANISH_MOBILE_LENGTH = 9;
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;
const INTERNATIONAL_CALL_PREFIX = '00';
const EMAIL_PART_COUNT = 2;

export type InviteContact = { kind: 'email'; email: string } | { kind: 'phone'; phone: string };

/** `+34600111222`: sin espacios ni guiones; 9 cifras sin prefijo se toman como españolas. */
function normalizePhone(rawPhone: string): string | null {
  const compact = rawPhone.replace(/[\s().-]/g, '');
  const withPlus = compact.startsWith(INTERNATIONAL_CALL_PREFIX)
    ? `+${compact.slice(INTERNATIONAL_CALL_PREFIX.length)}`
    : compact;
  const isLocalSpanish = /^\d+$/.test(withPlus) && withPlus.length === SPANISH_MOBILE_LENGTH;
  const international = isLocalSpanish ? `${SPAIN_PREFIX}${withPlus}` : withPlus;
  if (!/^\+\d+$/.test(international)) return null;
  const digitCount = international.length - 1;
  return digitCount >= MIN_PHONE_DIGITS && digitCount <= MAX_PHONE_DIGITS ? international : null;
}

/** Una sola «@», sin espacios, y un dominio con punto que no empieza ni acaba en él. */
function isPlausibleEmail(contact: string): boolean {
  const parts = contact.split('@');
  const [localPart = '', domain = ''] = parts;
  const hasWhitespace = /\s/.test(contact);
  const hasValidDomain = domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
  return parts.length === EMAIL_PART_COUNT && localPart !== '' && !hasWhitespace && hasValidDomain;
}

/** Un solo campo: con «@» es un correo; si no, un teléfono. `null` si no es ninguno de los dos. */
export function parseInviteContact(rawContact: string): InviteContact | null {
  const contact = rawContact.trim();
  if (contact.includes('@')) {
    return isPlausibleEmail(contact) ? { kind: 'email', email: contact.toLowerCase() } : null;
  }
  const phone = normalizePhone(contact);
  return phone === null ? null : { kind: 'phone', phone };
}
