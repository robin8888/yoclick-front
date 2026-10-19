import type { ReceiptResponseDto } from '@/shared/api/generated/model';

import { buildReceiptHtml } from './build-receipt-html';

const RECEIPT: ReceiptResponseDto = {
  receiptNumber: '2026-000007',
  issuedAt: '2026-10-19T10:00:00.000Z',
  seller: {
    legalName: 'Academia Ninja SL',
    taxId: 'B12345678',
    taxAddress: 'Calle Mayor 1, 28013 Madrid',
  },
  buyerName: 'Ana <Ruiz>',
  concept: 'Bono 10 clases',
  baseCents: 4132,
  vatRatePercent: 21,
  vatCents: 868,
  totalCents: 5000,
  refundedCents: 0,
};

describe('buildReceiptHtml', () => {
  it('lists who charges, the number, the base, the VAT and the total', () => {
    const html = buildReceiptHtml(RECEIPT, 'Europe/Madrid');

    expect(html).toContain('2026-000007');
    expect(html).toContain('Academia Ninja SL');
    expect(html).toContain('B12345678');
    expect(html).toContain('Bono 10 clases');
    expect(html).toContain('IVA (21 %)');
    expect(html).toContain('incluye el IVA');
  });

  it('escapes what a person typed, so it cannot inject markup', () => {
    const html = buildReceiptHtml(RECEIPT, 'Europe/Madrid');

    expect(html).toContain('Ana &lt;Ruiz&gt;');
    expect(html).not.toContain('<Ruiz>');
  });

  it('mentions a refund only when there is one', () => {
    const refunded = buildReceiptHtml({ ...RECEIPT, refundedCents: 2000 }, 'Europe/Madrid');

    expect(refunded).toContain('Reembolsado');
    expect(buildReceiptHtml(RECEIPT, 'Europe/Madrid')).not.toContain('Reembolsado');
  });
});
