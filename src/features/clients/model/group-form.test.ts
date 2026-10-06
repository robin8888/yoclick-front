import { groupFormSchema, mapGroupFormToRequest } from './group-form';

describe('groupFormSchema', () => {
  it.each([
    ['a named group', { name: 'Grupo mañanas' }, true],
    ['a blank name', { name: '   ' }, false],
    ['a name over 80 characters', { name: 'a'.repeat(81) }, false],
  ])('%s', (_caseName, values, isExpectedValid) => {
    expect(groupFormSchema.safeParse(values).success).toBe(isExpectedValid);
  });
});

describe('mapGroupFormToRequest', () => {
  it('sends only the name when nothing else is chosen', () => {
    expect(
      mapGroupFormToRequest({ name: ' Grupo A ' }, { levelChoice: '', instructorChoice: '' }),
    ).toEqual({ name: 'Grupo A' });
  });

  it('adds the level and the instructor when they are chosen', () => {
    expect(
      mapGroupFormToRequest(
        { name: 'Grupo A' },
        { levelChoice: 'advanced', instructorChoice: 'membership-1' },
      ),
    ).toEqual({ name: 'Grupo A', level: 'advanced', instructorMembershipId: 'membership-1' });
  });
});
