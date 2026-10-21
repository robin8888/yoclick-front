import { describeAuditEntry } from './audit-description';

describe('describeAuditEntry', () => {
  it.each([
    {
      caseName: 'a status change in words',
      entry: { action: 'center_status_changed', details: { from: 'trial', to: 'suspended' } },
      expected: 'Estado: En prueba → Suspendido',
    },
    {
      caseName: 'a new trial end as a short date',
      entry: { action: 'trial_changed', details: { from: null, to: '2026-11-15T10:00:00.000Z' } },
      expected: 'Fin de la prueba: dom 15 nov',
    },
    {
      caseName: 'a removed trial',
      entry: { action: 'trial_changed', details: { from: '2026-11-15T10:00:00.000Z', to: null } },
      expected: 'Prueba quitada',
    },
    {
      caseName: 'a cap that goes from a number to none',
      entry: { action: 'max_clients_changed', details: { from: 150, to: null } },
      expected: 'Tope de clientes: 150 → sin tope',
    },
    {
      caseName: 'an action it does not know yet',
      entry: { action: 'something_new', details: {} },
      expected: 'Cambio registrado',
    },
    {
      caseName: 'a status change with unreadable details',
      entry: { action: 'center_status_changed', details: { from: 3 } },
      expected: 'Cambio registrado',
    },
  ])('describes $caseName', ({ entry, expected }) => {
    expect(describeAuditEntry(entry)).toBe(expected);
  });
});
