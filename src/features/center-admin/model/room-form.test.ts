import {
  buildEmptyRoomForm,
  buildRoomForm,
  EMPTY_ROOM_PLACE,
  mapRoomFormToCreateRequest,
  roomFormSchema,
  toRoomPlaceRequest,
} from './room-form';

describe('roomFormSchema', () => {
  const validForm = {
    name: 'Sala 1',
    capacity: '12',
    staffMembershipId: '',
    serviceIds: [],
    fixedServiceId: '',
    place: EMPTY_ROOM_PLACE,
  };

  it('accepts a named room with a capacity', () => {
    expect(roomFormSchema.safeParse(validForm).success).toBe(true);
  });

  it.each([
    ['a blank name', { name: '   ' }],
    ['a name over 80 characters', { name: 'a'.repeat(81) }],
    ['a zero capacity', { capacity: '0' }],
    ['a decimal capacity', { capacity: '2,5' }],
    ['a capacity over 500', { capacity: '501' }],
    ['a text capacity', { capacity: 'muchas' }],
  ])('rejects %s', (_caseName, overrides) => {
    expect(roomFormSchema.safeParse({ ...validForm, ...overrides }).success).toBe(false);
  });
});

describe('mapRoomFormToCreateRequest', () => {
  it('trims the name and sends the capacity as a number', () => {
    expect(
      mapRoomFormToCreateRequest({
        name: ' Tatami ',
        capacity: '8',
        staffMembershipId: '',
        serviceIds: [],
        fixedServiceId: '',
        place: EMPTY_ROOM_PLACE,
      }),
    ).toEqual({
      name: 'Tatami',
      capacity: 8,
      staffMembershipId: null,
      serviceIds: [],
      serviceId: null,
      place: null,
    });
  });

  it('sends the teacher of the room when one is chosen', () => {
    expect(
      mapRoomFormToCreateRequest({
        name: 'Sala 1',
        capacity: '8',
        staffMembershipId: 'membership-ana',
        serviceIds: ['service-1'],
        fixedServiceId: 'service-1',
        place: EMPTY_ROOM_PLACE,
      }),
    ).toEqual({
      name: 'Sala 1',
      capacity: 8,
      staffMembershipId: 'membership-ana',
      serviceIds: ['service-1'],
      serviceId: 'service-1',
      place: null,
    });
  });

  it('starts with an empty name and a ten-person capacity', () => {
    expect(buildEmptyRoomForm()).toEqual({
      name: '',
      capacity: '10',
      staffMembershipId: '',
      serviceIds: [],
      fixedServiceId: '',
      place: EMPTY_ROOM_PLACE,
    });
  });
});

describe('the place of an outdoor room', () => {
  const OUTDOOR = {
    isOutdoor: true,
    address: { text: ' Parque del Retiro ', latitude: 40.41, longitude: -3.68 },
    pin: null,
  };

  it.each([
    ['a room of the center', EMPTY_ROOM_PLACE, null],
    [
      'an outdoor room with the point of its address',
      OUTDOOR,
      { address: 'Parque del Retiro', latitude: 40.41, longitude: -3.68 },
    ],
    [
      'an outdoor room with a point fixed by hand, which wins',
      { ...OUTDOOR, pin: { latitude: 40.5, longitude: -3.7 } },
      { address: 'Parque del Retiro', latitude: 40.5, longitude: -3.7 },
    ],
    [
      'an outdoor room with only a point',
      {
        isOutdoor: true,
        address: { text: '', latitude: null, longitude: null },
        pin: { latitude: 1, longitude: 2 },
      },
      { address: null, latitude: 1, longitude: 2 },
    ],
  ])('sends the place of %s', (_case, place, expectedPlace) => {
    expect(toRoomPlaceRequest(place)).toEqual(expectedPlace);
  });

  it('fills the form of an outdoor room that already exists', () => {
    const form = buildRoomForm({
      id: 'room-1',
      name: 'Pista',
      capacity: 10,
      staff: null,
      fixedService: null,
      services: [],
      place: { address: 'Parque', latitude: 40.4, longitude: -3.7 },
    });

    expect(form.place).toEqual({
      isOutdoor: true,
      address: { text: 'Parque', latitude: 40.4, longitude: -3.7 },
      pin: null,
    });
  });
});
