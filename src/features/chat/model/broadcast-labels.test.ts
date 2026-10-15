import { describeClassMeta } from './broadcast-labels';

describe('describeClassMeta', () => {
  it('says the days, the hour, the room and how many are enrolled', () => {
    expect(
      describeClassMeta({
        roomName: 'Sala 1',
        weekdays: [3, 1],
        startsAtTime: '18:00',
        enrolledCount: 3,
      }),
    ).toBe('lun, mié 18:00 · Sala 1 · 3 apuntadas');
  });

  it('skips the room when the class has none', () => {
    expect(
      describeClassMeta({ roomName: null, weekdays: [2], startsAtTime: '10:00', enrolledCount: 1 }),
    ).toBe('mar 10:00 · 1 apuntada');
  });
});
