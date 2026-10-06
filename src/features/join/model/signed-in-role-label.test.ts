import { resolveSignedInRoleLabel } from './signed-in-role-label';

describe('resolveSignedInRoleLabel', () => {
  it.each([
    {
      caseName: 'no center yet',
      role: null,
      sectorId: undefined,
      expectedLabel: 'Sin centro todavía',
    },
    { caseName: 'an owner', role: 'owner', sectorId: 'marciales', expectedLabel: 'Propietario' },
    { caseName: 'an admin', role: 'admin', sectorId: 'gym', expectedLabel: 'Administrador' },
    { caseName: 'staff of a gym', role: 'staff', sectorId: 'gym', expectedLabel: 'Instructor' },
    {
      caseName: 'staff of an academy',
      role: 'staff',
      sectorId: 'academia',
      expectedLabel: 'Profesor',
    },
    {
      caseName: 'a client of a dance school',
      role: 'client',
      sectorId: 'baile',
      expectedLabel: 'Alumno',
    },
    { caseName: 'a client of a gym', role: 'client', sectorId: 'gym', expectedLabel: 'Cliente' },
  ] as const)('labels $caseName', ({ role, sectorId, expectedLabel }) => {
    expect(resolveSignedInRoleLabel({ role, sectorId })).toBe(expectedLabel);
  });
});
