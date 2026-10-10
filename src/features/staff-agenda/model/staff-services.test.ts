import { buildService } from '@/test/booking-factories';

import { listServicesOfStaff, resolveServiceId } from './staff-services';

const ANA = { membershipId: 'staff-ana', fullName: 'Ana', photoUrl: null, photos: [] };
const BEN = { membershipId: 'staff-ben', fullName: 'Ben', photoUrl: null, photos: [] };
const SALSA = buildService({ id: 'service-salsa', name: 'Salsa', staff: [ANA, BEN] });
const KARATE = buildService({ id: 'service-karate', name: 'Kárate', staff: [BEN] });

describe('listServicesOfStaff', () => {
  it.each([
    ['a person who gives two services', 'staff-ben', ['service-salsa', 'service-karate']],
    ['a person who gives one', 'staff-ana', ['service-salsa']],
    ['a person who gives none', 'staff-cleo', []],
    ['nobody chosen yet', null, []],
  ])('%s', (_caseName, staffMembershipId, expectedIds) => {
    expect(listServicesOfStaff([SALSA, KARATE], staffMembershipId).map(({ id }) => id)).toEqual(
      expectedIds,
    );
  });
});

describe('resolveServiceId', () => {
  const allServices = [SALSA, KARATE];

  it('keeps the chosen service even when that person does not give it', () => {
    expect(
      resolveServiceId({ allServices, staffServices: [SALSA], chosenServiceId: 'service-karate' }),
    ).toBe('service-karate');
  });

  it('picks the only service of the person without asking', () => {
    expect(resolveServiceId({ allServices, staffServices: [SALSA], chosenServiceId: null })).toBe(
      'service-salsa',
    );
  });

  it('waits for a choice when the person gives several or none', () => {
    expect(
      resolveServiceId({ allServices, staffServices: allServices, chosenServiceId: null }),
    ).toBeNull();
    expect(
      resolveServiceId({ allServices, staffServices: [], chosenServiceId: 'other' }),
    ).toBeNull();
  });
});
