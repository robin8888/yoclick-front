import {
  buildBlockListRange,
  buildEmptyRoomBlockForm,
  describeBlockReason,
  describeBlockWhen,
  mapRoomBlockFormToRequest,
  roomBlockFormSchema,
} from './room-block-form';

const TODAY = '2026-10-12';

describe('roomBlockFormSchema', () => {
  const validForm = { ...buildEmptyRoomBlockForm(TODAY), note: 'Asociación de vecinos' };

  it('accepts a morning rental with a note', () => {
    expect(roomBlockFormSchema.safeParse(validForm).success).toBe(true);
  });

  it.each([
    ['a missing date', { date: '' }],
    ['an end before the start', { startsAtTime: '14:00', endsAtTime: '09:00' }],
    ['a note over 200 characters', { note: 'a'.repeat(201) }],
  ])('rejects %s', (_caseName, overrides) => {
    expect(roomBlockFormSchema.safeParse({ ...validForm, ...overrides }).success).toBe(false);
  });
});

describe('mapRoomBlockFormToRequest', () => {
  it('turns the local hours of the center into UTC instants and drops an empty note', () => {
    expect(
      mapRoomBlockFormToRequest(buildEmptyRoomBlockForm('2026-07-15'), 'Europe/Madrid'),
    ).toEqual({
      startsAt: '2026-07-15T07:00:00.000Z',
      endsAt: '2026-07-15T12:00:00.000Z',
      reason: 'rental',
    });
  });

  it('keeps the note when there is one', () => {
    expect(
      mapRoomBlockFormToRequest(
        { ...buildEmptyRoomBlockForm(TODAY), reason: 'event', note: 'Exhibición' },
        'UTC',
      ),
    ).toEqual({
      startsAt: '2026-10-12T09:00:00.000Z',
      endsAt: '2026-10-12T14:00:00.000Z',
      reason: 'event',
      note: 'Exhibición',
    });
  });
});

describe('block descriptions', () => {
  it('describes a block within one day and one that crosses midnight', () => {
    expect(
      describeBlockWhen(
        { startsAt: '2026-10-17T08:00:00.000Z', endsAt: '2026-10-17T12:00:00.000Z' },
        'Europe/Madrid',
      ),
    ).toBe('sáb 17 oct · 10:00–14:00');
    expect(
      describeBlockWhen(
        { startsAt: '2026-10-17T20:00:00.000Z', endsAt: '2026-10-18T00:00:00.000Z' },
        'Europe/Madrid',
      ),
    ).toBe('sáb 17 oct 22:00 – dom 18 oct 02:00');
  });

  it('names every reason', () => {
    expect(describeBlockReason('rental')).toBe('Alquiler');
    expect(describeBlockReason('maintenance')).toBe('Mantenimiento');
    expect(describeBlockReason('event')).toBe('Evento');
    expect(describeBlockReason('other')).toBe('Otro');
  });

  it('lists the next eight weeks', () => {
    expect(buildBlockListRange(TODAY)).toEqual({ from: TODAY, to: '2026-12-07' });
  });
});
