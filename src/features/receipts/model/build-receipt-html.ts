import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import type { ReceiptResponseDto } from '@/shared/api/generated/model';

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (character) => HTML_ESCAPES[character] ?? character);
}

const RECEIPT_STYLES = `
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: black; padding: 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { color: dimgray; font-size: 13px; margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
  td { border-bottom: 1px solid lightgray; padding: 8px 6px; }
  .number { text-align: right; }
  .total td { border-bottom: 2px solid black; font-weight: bold; font-size: 16px; }
`;

function buildSellerLines(seller: ReceiptResponseDto['seller']): string {
  const lines = [seller.legalName, seller.taxId, seller.taxAddress].filter(
    (line): line is string => line !== null && line !== '',
  );
  return lines.map((line) => `<p class="meta">${escapeHtml(line)}</p>`).join('');
}

/** El recibo como una página HTML: quién cobra, a quién, el concepto y la base, el IVA y el total. */
export function buildReceiptHtml(receipt: Readonly<ReceiptResponseDto>, timeZone: string): string {
  const refunded =
    receipt.refundedCents > 0
      ? `<p class="meta">${escapeHtml(i18n.t('receipts.refunded', { amount: formatEuros(receipt.refundedCents) }))}</p>`
      : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${RECEIPT_STYLES}</style></head><body>
<h1>${escapeHtml(i18n.t('receipts.title'))} ${escapeHtml(receipt.receiptNumber)}</h1>
<p class="meta">${escapeHtml(formatShortDate(receipt.issuedAt, timeZone))}</p>
${buildSellerLines(receipt.seller)}
<p class="meta">${escapeHtml(i18n.t('receipts.buyer', { name: receipt.buyerName }))}</p>
<table>
<tr><td>${escapeHtml(receipt.concept)}</td><td class="number"></td></tr>
<tr><td>${escapeHtml(i18n.t('receipts.base'))}</td><td class="number">${escapeHtml(formatEuros(receipt.baseCents))}</td></tr>
<tr><td>${escapeHtml(i18n.t('receipts.vat', { rate: receipt.vatRatePercent }))}</td><td class="number">${escapeHtml(formatEuros(receipt.vatCents))}</td></tr>
<tr class="total"><td>${escapeHtml(i18n.t('receipts.total'))}</td><td class="number">${escapeHtml(formatEuros(receipt.totalCents))}</td></tr>
</table>
<p class="meta">${escapeHtml(i18n.t('receipts.vatIncludedNote'))}</p>
${refunded}
</body></html>`;
}
