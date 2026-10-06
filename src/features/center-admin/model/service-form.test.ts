import {
  buildEmptyServiceForm,
  formatPriceForInput,
  mapFormToCreateRequest,
  mapFormToServiceChanges,
  parsePriceInCents,
  serviceFormSchema,
} from './service-form';

describe('parsePriceInCents', () => {
  it.each([
    ['35', 3500],
    ['35,5', 3550],
    ['35.50', 3550],
    ['0', 0],
    ['0,99', 99],
  ])('reads «%s» as %i cents', (priceText, expectedCents) => {
    expect(parsePriceInCents(priceText)).toBe(expectedCents);
  });

  it.each(['', 'abc', '-3', '3,555', '100001', '1e3'])('rejects «%s»', (priceText) => {
    expect(parsePriceInCents(priceText)).toBeNull();
  });
});

describe('formatPriceForInput', () => {
  it.each([
    [null, ''],
    [3500, '35'],
    [3550, '35,50'],
    [0, '0'],
  ])('shows %s cents as «%s»', (priceCents, expectedText) => {
    expect(formatPriceForInput(priceCents)).toBe(expectedText);
  });
});

describe('serviceFormSchema', () => {
  const validForm = { ...buildEmptyServiceForm(), name: 'Entrenamiento personal' };

  it('accepts a minimal service', () => {
    expect(serviceFormSchema.safeParse(validForm).success).toBe(true);
  });

  it.each([
    ['a short name', { name: 'E' }],
    ['a duration under five minutes', { durationMinutes: '3' }],
    ['a decimal duration', { durationMinutes: '45,5' }],
    ['a duration over ten hours', { durationMinutes: '601' }],
    ['a price that is not a number', { priceInEuros: 'gratis' }],
  ])('rejects %s', (_caseName, overrides) => {
    expect(serviceFormSchema.safeParse({ ...validForm, ...overrides }).success).toBe(false);
  });
});

describe('service form mapping', () => {
  it('sends null to clear an optional field when editing', () => {
    expect(mapFormToServiceChanges({ ...buildEmptyServiceForm(), name: 'Valoración' })).toEqual({
      name: 'Valoración',
      description: null,
      durationMinutes: 60,
      priceCents: null,
      isVisible: true,
      roomId: null,
    });
  });

  it('omits empty optional fields when creating', () => {
    expect(mapFormToCreateRequest({ ...buildEmptyServiceForm(), name: 'Valoración' })).toEqual({
      name: 'Valoración',
      durationMinutes: 60,
      isVisible: true,
    });
  });

  it('keeps the description and price when creating', () => {
    expect(
      mapFormToCreateRequest({
        name: 'Valoración',
        description: 'Primera visita',
        durationMinutes: '30',
        priceInEuros: '25',
        isVisible: false,
        staffMembershipIds: [],
        roomId: '',
      }),
    ).toEqual({
      name: 'Valoración',
      description: 'Primera visita',
      durationMinutes: 30,
      priceCents: 2500,
      isVisible: false,
    });
  });

  it('sends the room when one is chosen and null to take it off when editing', () => {
    const formWithRoom = { ...buildEmptyServiceForm(), name: 'Valoración', roomId: 'room-1' };

    expect(mapFormToCreateRequest(formWithRoom).roomId).toBe('room-1');
    expect(mapFormToServiceChanges(formWithRoom).roomId).toBe('room-1');
    expect(mapFormToServiceChanges({ ...formWithRoom, roomId: '' }).roomId).toBeNull();
  });

  it('sends who gives the service when someone is chosen, when creating and when editing', () => {
    const formWithStaff = {
      ...buildEmptyServiceForm(),
      name: 'Valoración',
      staffMembershipIds: ['member-1', 'member-2'],
    };

    expect(mapFormToCreateRequest(formWithStaff).staffMembershipIds).toEqual([
      'member-1',
      'member-2',
    ]);
    expect(mapFormToServiceChanges(formWithStaff).staffMembershipIds).toEqual([
      'member-1',
      'member-2',
    ]);
  });
});
