import type { UpdatePlatformPlanRequestDto } from '@/shared/api/generated/model';

const CENTS_PER_EURO = 100;
const CENT_DECIMAL_PLACES = 2;
const MAX_PRICE_CENTS = 1_000_000;
// «79», «79,5», «79.50»: euros enteros con hasta dos decimales, con coma o con punto.
const EUROS_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;

export interface PlanPrices {
  monthlyPriceCents: number;
  annualMonthlyPriceCents: number;
  setupFeeCents: number;
}

/** Lo que se escribe en cada campo: euros como texto, tal cual lo ve quien edita. */
export interface PlanPriceDraft {
  monthly: string;
  annualMonthly: string;
  setupFee: string;
}

export type PlanPriceFieldError = 'invalid' | 'annualAboveMonthly';

export type PlanPriceValidation =
  | { readonly isValid: true; readonly changes: UpdatePlatformPlanRequestDto }
  | { readonly isValid: false; readonly error: PlanPriceFieldError };

/** Euros escritos a mano en céntimos; `null` si no es un importe válido o se pasa del tope de la API. */
export function parseEurosToCents(text: string): number | null {
  const trimmedText = text.trim();
  if (!EUROS_PATTERN.test(trimmedText)) return null;
  const cents = Math.round(Number(trimmedText.replace(',', '.')) * CENTS_PER_EURO);
  return cents <= MAX_PRICE_CENTS ? cents : null;
}

/** Céntimos como texto editable en euros: «79» si son redondos, «79,50» si no. */
export function formatCentsForInput(cents: number): string {
  const euros = cents / CENTS_PER_EURO;
  return Number.isInteger(euros)
    ? String(euros)
    : euros.toFixed(CENT_DECIMAL_PLACES).replace('.', ',');
}

export function buildPlanPriceDraft(prices: PlanPrices): PlanPriceDraft {
  return {
    monthly: formatCentsForInput(prices.monthlyPriceCents),
    annualMonthly: formatCentsForInput(prices.annualMonthlyPriceCents),
    setupFee: formatCentsForInput(prices.setupFeeCents),
  };
}

/**
 * Valida lo escrito y devuelve solo los importes que cambian respecto al plan actual. La API aplica
 * las mismas reglas: el precio anual por mes no puede superar al mensual.
 */
export function validatePlanPriceDraft(
  draft: PlanPriceDraft,
  current: PlanPrices,
): PlanPriceValidation {
  const monthly = parseEurosToCents(draft.monthly);
  const annualMonthly = parseEurosToCents(draft.annualMonthly);
  const setupFee = parseEurosToCents(draft.setupFee);
  if (monthly === null || annualMonthly === null || setupFee === null) {
    return { isValid: false, error: 'invalid' };
  }
  if (annualMonthly > monthly) return { isValid: false, error: 'annualAboveMonthly' };
  return {
    isValid: true,
    changes: {
      ...(monthly === current.monthlyPriceCents ? {} : { monthlyPriceCents: monthly }),
      ...(annualMonthly === current.annualMonthlyPriceCents
        ? {}
        : { annualMonthlyPriceCents: annualMonthly }),
      ...(setupFee === current.setupFeeCents ? {} : { setupFeeCents: setupFee }),
    },
  };
}
