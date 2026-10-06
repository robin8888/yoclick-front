import type { ActivityResponseDtoEntriesItem } from '@/shared/api/generated/model';

import { describeActivityAction, formatActivityMoment } from './activity-text';

const MADRID = 'Europe/Madrid';

function buildEntry(
  overrides: Partial<ActivityResponseDtoEntriesItem>,
): ActivityResponseDtoEntriesItem {
  return {
    id: '0191d6a0-0000-7000-8000-000000000001',
    kind: 'service_updated',
    subject: 'Clase particular',
    actorName: 'Marta Ruiz',
    createdAt: '2026-10-06T07:12:00.000Z',
    ...overrides,
  };
}

describe('describeActivityAction', () => {
  it.each([
    [
      { kind: 'service_updated', subject: 'Clase particular' },
      'cambió el servicio «Clase particular»',
    ],
    [{ kind: 'client_updated', subject: 'Ana Serrano' }, 'actualizó los datos de Ana Serrano'],
    [{ kind: 'join_code_regenerated', subject: null }, 'cambió el código del centro'],
    [{ kind: 'service_archived', subject: null }, 'archivó un servicio'],
    [{ kind: 'algo_nuevo', subject: null }, 'hizo un cambio'],
    [{ kind: 'service_updated', subject: null }, 'hizo un cambio'],
  ])('writes the sentence of %j', (overrides, expectedText) => {
    expect(describeActivityAction(buildEntry(overrides))).toBe(expectedText);
  });
});

describe('formatActivityMoment', () => {
  const now = new Date('2026-10-06T15:00:00.000Z');

  it.each([
    ['2026-10-06T07:12:00.000Z', 'Hoy 09:12'],
    ['2026-10-05T19:30:00.000Z', 'Ayer 21:30'],
    ['2026-09-27T10:00:00.000Z', 'dom 27 sep'],
  ])('writes %s as %s', (isoInstant, expectedText) => {
    expect(formatActivityMoment(isoInstant, now, MADRID)).toBe(expectedText);
  });

  it('counts the days in the time zone of the center, not in UTC', () => {
    expect(formatActivityMoment('2026-10-05T22:30:00.000Z', now, MADRID)).toBe('Hoy 00:30');
  });
});
