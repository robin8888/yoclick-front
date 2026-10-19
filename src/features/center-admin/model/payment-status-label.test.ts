import { buildPaymentStatusLabel } from './payment-status-label';

interface StatusLabelCase {
  name: string;
  payment: Parameters<typeof buildPaymentStatusLabel>[0];
  expectedLabel: string;
}

const STATUS_LABEL_CASES: StatusLabelCase[] = [
  {
    name: 'a pending payment',
    payment: { status: 'pending', amountCents: 5000, refundedCents: 0 },
    expectedLabel: 'Pendiente',
  },
  {
    name: 'a failed payment',
    payment: { status: 'failed', amountCents: 5000, refundedCents: 0 },
    expectedLabel: 'Fallido',
  },
  {
    name: 'a paid payment',
    payment: { status: 'succeeded', amountCents: 5000, refundedCents: 0 },
    expectedLabel: 'Pagado',
  },
  {
    name: 'a fully refunded payment',
    payment: { status: 'succeeded', amountCents: 5000, refundedCents: 5000 },
    expectedLabel: 'Reembolsado',
  },
  {
    name: 'a payment refunded beyond its amount',
    payment: { status: 'succeeded', amountCents: 5000, refundedCents: 6000 },
    expectedLabel: 'Reembolsado',
  },
];

describe('buildPaymentStatusLabel', () => {
  it.each(STATUS_LABEL_CASES)('labels $name', ({ payment, expectedLabel }) => {
    expect(buildPaymentStatusLabel(payment)).toBe(expectedLabel);
  });

  it('names the refunded amount on a partial refund', () => {
    const label = buildPaymentStatusLabel({
      status: 'succeeded',
      amountCents: 5000,
      refundedCents: 2000,
    });

    expect(label).toMatch(/^Reembolsado 20/);
  });
});
