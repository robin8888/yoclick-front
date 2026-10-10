/** Mismo patrón que el servidor: prefijo opcional, cifras, espacios, paréntesis y guiones. */
const PHONE_PATTERN = /^\+?[\d\s()-]{6,20}$/;
export const MAX_ADDRESS_LENGTH = 200;

export interface MyDataDraft {
  phone: string;
  address: string;
}

export type MyDataProblem = 'phone-invalid' | 'address-too-long';

/** Teléfono y dirección son opcionales: vacío es válido y significa «sin dato». */
export function findMyDataProblems(draft: MyDataDraft): MyDataProblem[] {
  const problems: MyDataProblem[] = [];
  const phone = draft.phone.trim();
  if (phone !== '' && !PHONE_PATTERN.test(phone)) problems.push('phone-invalid');
  if (draft.address.trim().length > MAX_ADDRESS_LENGTH) problems.push('address-too-long');
  return problems;
}

export interface MyDataPatch {
  phone?: string | null;
  address?: string | null;
}

function toOptionalText(text: string): string | null {
  const trimmed = text.trim();
  return trimmed === '' ? null : trimmed;
}

/** Solo lo que cambia respecto a lo guardado (`null` borra el dato); `null` si no hay nada que guardar. */
export function buildMyDataPatch(
  draft: MyDataDraft,
  saved: { phone: string | null; address: string | null },
): MyDataPatch | null {
  const patch: MyDataPatch = {};
  const phone = toOptionalText(draft.phone);
  const address = toOptionalText(draft.address);
  if (phone !== saved.phone) patch.phone = phone;
  if (address !== saved.address) patch.address = address;
  return Object.keys(patch).length === 0 ? null : patch;
}
