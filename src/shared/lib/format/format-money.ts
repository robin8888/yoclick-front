const CENTS_PER_EURO = 100;
const THOUSANDS_GROUP_SIZE = 3;
const CENT_DIGITS = 2;
// En es-ES un número de 4 cifras no lleva separador de miles («1234 €»), el de 5 sí («12.480 €»).
const MIN_DIGITS_FOR_THOUSANDS_SEPARATOR = 5;
const NON_BREAKING_SPACE = '\u00a0';

export interface Money {
  readonly amountCents: number;
  readonly currency: 'EUR';
}

function groupThousands(wholeDigits: string): string {
  if (wholeDigits.length < MIN_DIGITS_FOR_THOUSANDS_SEPARATOR) return wholeDigits;
  const groups: string[] = [];
  for (let end = wholeDigits.length; end > 0; end -= THOUSANDS_GROUP_SIZE) {
    groups.unshift(wholeDigits.slice(Math.max(0, end - THOUSANDS_GROUP_SIZE), end));
  }
  return groups.join('.');
}

/**
 * Euros desde céntimos, sin decimales si son redondos: 1248000 → «12.480 €», 3550 → «35,50 €».
 * Se formatea a mano (no con Intl) para que el resultado sea idéntico en iOS, Android y tests.
 */
export function formatMoney({ amountCents }: Money): string {
  if (!Number.isInteger(amountCents)) throw new RangeError('amountCents must be an integer');
  const sign = amountCents < 0 ? '-' : '';
  const absoluteCents = Math.abs(amountCents);
  const wholeEuros = groupThousands(String(Math.floor(absoluteCents / CENTS_PER_EURO)));
  const remainingCents = absoluteCents % CENTS_PER_EURO;
  const decimals =
    remainingCents === 0 ? '' : `,${String(remainingCents).padStart(CENT_DIGITS, '0')}`;
  return `${sign}${wholeEuros}${decimals}${NON_BREAKING_SPACE}€`;
}

export function formatEuros(amountCents: number): string {
  return formatMoney({ amountCents, currency: 'EUR' });
}
