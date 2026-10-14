import type { CheckInResponseDto } from '@/shared/api/generated/model';

import { buildScanVerdict } from './scan-verdict';

const ROLE_WORDS = { clientWord: 'alumno', staffWord: 'profesor' } as const;
const TIME_ZONE = 'Europe/Madrid';

function buildCheckIn(overrides: Partial<CheckInResponseDto>): CheckInResponseDto {
  return {
    kind: 'client',
    person: { membershipId: 'm1', fullName: 'Lucía Torres', photoUrl: null, role: 'client' },
    access: { isGranted: true, reason: 'valid_pass', pass: null },
    ...overrides,
  };
}

describe('buildScanVerdict', () => {
  it('lets a person with a valid pass in and says which pass and how many classes are left', () => {
    const verdict = buildScanVerdict({
      checkIn: buildCheckIn({
        access: {
          isGranted: true,
          reason: 'valid_pass',
          pass: {
            name: 'Bono 10 clases',
            remainingSessions: 6,
            totalSessions: 10,
            expiresAt: null,
          },
        },
      }),
      roleWords: ROLE_WORDS,
      timeZone: TIME_ZONE,
    });

    expect(verdict).toEqual({
      isGranted: true,
      headline: 'Puede entrar',
      reasonLine: 'Bono vigente: Bono 10 clases · quedan 6 de 10',
      roleLabel: 'Alumno',
    });
  });

  it.each([
    { reason: 'no_pass', expected: 'No tiene ningún bono' },
    { reason: 'pass_pending', expected: 'Su bono está pendiente de activar' },
    { reason: 'pass_exhausted', expected: 'Se le han agotado las clases del bono' },
    { reason: 'pass_expired', expected: 'Su bono ha caducado' },
  ] as const)('refuses entry with the reason $reason', ({ reason, expected }) => {
    const verdict = buildScanVerdict({
      checkIn: buildCheckIn({ access: { isGranted: false, reason, pass: null } }),
      roleWords: ROLE_WORDS,
      timeZone: TIME_ZONE,
    });

    expect(verdict.isGranted).toBe(false);
    expect(verdict.headline).toBe('No puede entrar');
    expect(verdict.reasonLine).toBe(expected);
  });

  it('writes the expiry date of an expired pass in the center time zone', () => {
    const verdict = buildScanVerdict({
      checkIn: buildCheckIn({
        access: {
          isGranted: false,
          reason: 'pass_expired',
          pass: {
            name: 'Bono 10 clases',
            remainingSessions: 3,
            totalSessions: 10,
            expiresAt: '2026-09-30T21:59:59.000Z',
          },
        },
      }),
      roleWords: ROLE_WORDS,
      timeZone: TIME_ZONE,
    });

    expect(verdict.reasonLine).toContain('caducó el');
  });

  it('names the team member role with the sector word', () => {
    const verdict = buildScanVerdict({
      checkIn: buildCheckIn({
        kind: 'staff',
        person: { membershipId: 'm2', fullName: 'Ana Pérez', photoUrl: null, role: 'staff' },
        access: { isGranted: true, reason: 'team_member', pass: null },
      }),
      roleWords: ROLE_WORDS,
      timeZone: TIME_ZONE,
    });

    expect(verdict.roleLabel).toBe('Profesor');
    expect(verdict.reasonLine).toBe('Equipo del centro');
  });

  it('calls administration by its own name', () => {
    const verdict = buildScanVerdict({
      checkIn: buildCheckIn({
        person: { membershipId: 'm3', fullName: 'Marta', photoUrl: null, role: 'owner' },
      }),
      roleWords: ROLE_WORDS,
      timeZone: TIME_ZONE,
    });

    expect(verdict.roleLabel).toBe('Administración');
  });
});
