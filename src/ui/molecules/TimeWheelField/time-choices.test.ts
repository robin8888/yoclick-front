import { listHourChoices, listMinuteChoices, listTimeChoices, snapToChoice } from './time-choices';

describe('listTimeChoices', () => {
  it('lists the day in the given steps', () => {
    const choices = listTimeChoices({ stepMinutes: 15 });

    expect(choices).toHaveLength(96);
    expect(choices[0]).toBe('00:00');
    expect(choices.at(-1)).toBe('23:45');
  });

  it('keeps only what is between the limits, both included', () => {
    expect(listTimeChoices({ minTime: '10:30', maxTime: '11:15', stepMinutes: 15 })).toEqual([
      '10:30',
      '10:45',
      '11:00',
      '11:15',
    ]);
  });

  it('rounds the earliest time up to the next step', () => {
    expect(listTimeChoices({ minTime: '10:07', maxTime: '10:30', stepMinutes: 15 })).toEqual([
      '10:15',
      '10:30',
    ]);
  });
});

describe('snapToChoice, listHourChoices and listMinuteChoices', () => {
  const CHOICES = ['10:30', '10:45', '11:00'];

  it.each([
    ['a time that is a choice', '10:45', '10:45'],
    ['a time before the first choice', '09:00', '10:30'],
    ['a time between two choices', '10:31', '10:45'],
    ['a time after the last choice', '23:00', '11:00'],
  ])('snaps %s', (_caseName, time, expected) => {
    expect(snapToChoice(time, CHOICES)).toBe(expected);
  });

  it('has nothing to snap to without choices', () => {
    expect(snapToChoice('10:00', [])).toBeNull();
  });

  it('splits the choices into hours and the minutes of one hour', () => {
    expect(listHourChoices(CHOICES)).toEqual(['10', '11']);
    expect(listMinuteChoices(CHOICES, '10')).toEqual(['30', '45']);
    expect(listMinuteChoices(CHOICES, '11')).toEqual(['00']);
  });
});
