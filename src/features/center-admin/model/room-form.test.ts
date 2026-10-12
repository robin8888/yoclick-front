import { buildEmptyRoomForm, mapRoomFormToCreateRequest, roomFormSchema } from './room-form';

describe('roomFormSchema', () => {
  const validForm = {
    name: 'Sala 1',
    capacity: '12',
    staffMembershipId: '',
    serviceIds: [],
    fixedServiceId: '',
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
      }),
    ).toEqual({
      name: 'Tatami',
      capacity: 8,
      staffMembershipId: null,
      serviceIds: [],
      serviceId: null,
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
      }),
    ).toEqual({
      name: 'Sala 1',
      capacity: 8,
      staffMembershipId: 'membership-ana',
      serviceIds: ['service-1'],
      serviceId: 'service-1',
    });
  });

  it('starts with an empty name and a ten-person capacity', () => {
    expect(buildEmptyRoomForm()).toEqual({
      name: '',
      capacity: '10',
      staffMembershipId: '',
      serviceIds: [],
      fixedServiceId: '',
    });
  });
});
