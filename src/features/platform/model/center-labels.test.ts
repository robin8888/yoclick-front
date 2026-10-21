import {
  buildClientsLine,
  buildLastBookingLine,
  buildUsageLine,
  getAttentionLabel,
  getStatusLabel,
  getStatusTone,
} from './center-labels';

const USAGE = {
  activeClientCount: 34,
  teamMemberCount: 2,
  bookingsLast30Days: 120,
  maxClients: 150,
  lastBookingAt: '2026-10-20T16:00:00.000Z',
} as const;

describe('center labels', () => {
  it('summarizes the usage in one line', () => {
    expect(buildUsageLine(USAGE)).toBe('34 clientes · 2 del equipo · 120 reservas en 30 d');
  });

  it('says how many clients there are against the cap, or that there is no cap', () => {
    expect(buildClientsLine(USAGE)).toBe('34 de 150 clientes');
    expect(buildClientsLine({ ...USAGE, maxClients: null })).toBe('34 clientes, sin tope');
  });

  it('gives the last booking as a short date, or says there are none', () => {
    expect(buildLastBookingLine(USAGE.lastBookingAt)).toBe('Última reserva: mar 20 oct');
    expect(buildLastBookingLine(null)).toBe('Aún sin reservas');
  });

  it.each([
    { status: 'trial', label: 'En prueba', tone: 'info' },
    { status: 'active', label: 'Activo', tone: 'success' },
    { status: 'past_due', label: 'En gracia', tone: 'warning' },
    { status: 'suspended', label: 'Suspendido', tone: 'danger' },
  ] as const)('shows $status as "$label" with a $tone tone', ({ status, label, tone }) => {
    expect(getStatusLabel(status)).toBe(label);
    expect(getStatusTone(status)).toBe(tone);
  });

  it('puts every reason to look at a center into words', () => {
    expect(getAttentionLabel('past-due')).toBe('Impago');
    expect(getAttentionLabel('over-limit')).toBe('Pasa su tope de clientes');
    expect(getAttentionLabel('trial-ending')).toBe('Prueba a punto de acabar');
    expect(getAttentionLabel('suspended')).toBe('Suspendido');
  });
});
