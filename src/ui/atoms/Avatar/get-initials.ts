const MAX_INITIALS = 2;
const FALLBACK_INITIALS = '?';

/** «Marta Gil Ortega» → «MG»; un solo nombre → una inicial; vacío → «?». */
export function getInitials(fullName: string): string {
  const nameParts = fullName.split(/\s+/).filter((namePart) => namePart.length > 0);
  if (nameParts.length === 0) return FALLBACK_INITIALS;
  return nameParts
    .slice(0, MAX_INITIALS)
    .map((namePart) => Array.from(namePart)[0] ?? '')
    .join('')
    .toLocaleUpperCase('es-ES');
}
