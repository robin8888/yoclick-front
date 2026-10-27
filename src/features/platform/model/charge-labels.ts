import type {
  PlatformChargeListResponseDtoDataItem,
  PlatformChargeListResponseDtoDataItemPaymentMethod,
  PlatformChargeListResponseDtoDataItemStatus,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';

const BASIS_POINTS_PER_PERCENT = 100;

export type PlatformCharge = PlatformChargeListResponseDtoDataItem;

export function getChargeStatusLabel(status: PlatformChargeListResponseDtoDataItemStatus): string {
  return i18n.t(`platform.charges.status.${status}`);
}

export function getPaymentMethodLabel(
  method: PlatformChargeListResponseDtoDataItemPaymentMethod,
): string {
  return i18n.t(`platform.charges.method.${method}`);
}

/** 2100 puntos básicos son «21»; 1050, «10,5». */
export function formatVatRate(vatBasisPoints: number): string {
  return String(vatBasisPoints / BASIS_POINTS_PER_PERCENT).replace('.', ',');
}

/** «Base 79,00 € · IVA 16,59 € (21 %)». */
export function buildChargeAmountsLine(charge: PlatformCharge): string {
  return i18n.t('platform.charges.amounts', {
    base: formatEuros(charge.baseCents),
    vat: formatEuros(charge.vatCents),
    rate: formatVatRate(charge.vatBasisPoints),
  });
}

/** Un cobro anulado no se cambia más; los pendientes todavía pueden cobrarse. */
export function canChargeBeEdited(status: PlatformChargeListResponseDtoDataItemStatus): boolean {
  return status !== 'void';
}
