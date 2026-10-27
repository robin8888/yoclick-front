import type {
  RecordPlatformChargeRequestDto,
  RecordPlatformChargeRequestDtoPaymentMethod,
} from '@/shared/api/generated/model';

import { formatCentsForInput, parseEurosToCents } from './plan-price-form';

const BASIS_POINTS_PER_PERCENT = 100;
const MAX_BASIS_POINTS = 10_000;
export const DEFAULT_VAT_RATE_TEXT = '21';
// «21», «10,5», «4.5»: porcentaje con hasta dos decimales, con coma o con punto.
const PERCENT_PATTERN = /^\d{1,3}(?:[.,]\d{1,2})?$/;

export type ChargePaymentMethod = RecordPlatformChargeRequestDtoPaymentMethod;

/** Lo que se escribe en el formulario de un cobro: importes como texto, tal cual los ve quien apunta. */
export interface ChargeDraft {
  concept: string;
  baseAmount: string;
  vatRate: string;
  paymentMethod: ChargePaymentMethod;
  customerLegalName: string;
  customerTaxId: string;
  invoiceReference: string;
}

export type ChargeFieldError = 'concept' | 'baseAmount' | 'vatRate';

export type ChargeValidation =
  | { readonly isValid: true; readonly request: RecordPlatformChargeRequestDto }
  | { readonly isValid: false; readonly error: ChargeFieldError };

export interface ChargeTarget {
  centerId: string;
  /** Día del cobro, `YYYY-MM-DD`. */
  chargedOn: string;
}

export function buildInitialChargeDraft(input: {
  concept: string;
  baseCents: number | null;
}): ChargeDraft {
  return {
    concept: input.concept,
    baseAmount: input.baseCents === null ? '' : formatCentsForInput(input.baseCents),
    vatRate: DEFAULT_VAT_RATE_TEXT,
    paymentMethod: 'transfer',
    customerLegalName: '',
    customerTaxId: '',
    invoiceReference: '',
  };
}

/** El tipo de IVA en puntos básicos (21 % = 2100); `null` si no es un porcentaje entre 0 y 100. */
export function parseVatRateToBasisPoints(text: string): number | null {
  const trimmedText = text.trim();
  if (!PERCENT_PATTERN.test(trimmedText)) return null;
  const basisPoints = Math.round(Number(trimmedText.replace(',', '.')) * BASIS_POINTS_PER_PERCENT);
  return basisPoints <= MAX_BASIS_POINTS ? basisPoints : null;
}

function toOptionalText(text: string): string | undefined {
  const trimmedText = text.trim();
  return trimmedText === '' ? undefined : trimmedText;
}

/** Valida lo escrito; la cuota de IVA y el total los calcula la API, aquí solo se manda la base y el tipo. */
export function validateChargeDraft(draft: ChargeDraft, target: ChargeTarget): ChargeValidation {
  const concept = draft.concept.trim();
  if (concept === '') return { isValid: false, error: 'concept' };
  const baseCents = parseEurosToCents(draft.baseAmount);
  if (baseCents === null) return { isValid: false, error: 'baseAmount' };
  const vatBasisPoints = parseVatRateToBasisPoints(draft.vatRate);
  if (vatBasisPoints === null) return { isValid: false, error: 'vatRate' };

  const invoiceReference = toOptionalText(draft.invoiceReference);
  const customerLegalName = toOptionalText(draft.customerLegalName);
  const customerTaxId = toOptionalText(draft.customerTaxId);
  return {
    isValid: true,
    request: {
      centerId: target.centerId,
      chargedOn: target.chargedOn,
      concept,
      baseCents,
      vatBasisPoints,
      paymentMethod: draft.paymentMethod,
      ...(invoiceReference === undefined ? {} : { invoiceReference }),
      ...(customerLegalName === undefined ? {} : { customerLegalName }),
      ...(customerTaxId === undefined ? {} : { customerTaxId }),
    },
  };
}
