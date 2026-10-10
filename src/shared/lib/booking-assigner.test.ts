import { describeBookingAssigner } from './booking-assigner';

describe('describeBookingAssigner', () => {
  it.each([
    ['client', 'Reservada por Marta Ruiz'],
    ['staff', 'Asignada por Marta Ruiz (equipo)'],
    ['admin', 'Asignada por Marta Ruiz (administración)'],
    ['owner', 'Asignada por Marta Ruiz (administración)'],
  ] as const)('says who assigned it when it was a %s', (role, expectedText) => {
    expect(describeBookingAssigner({ fullName: 'Marta Ruiz', role })).toBe(expectedText);
  });

  it('says nothing for appointments from before this data was kept', () => {
    expect(describeBookingAssigner(null)).toBeNull();
  });
});
