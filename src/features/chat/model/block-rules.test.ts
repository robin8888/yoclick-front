import { canBlockPerson, type ChatRole } from './block-rules';

describe('canBlockPerson', () => {
  it.each<{ myRole: ChatRole | null; counterpartRole: ChatRole; isAllowed: boolean }>([
    { myRole: 'client', counterpartRole: 'staff', isAllowed: true },
    { myRole: 'staff', counterpartRole: 'client', isAllowed: true },
    { myRole: 'client', counterpartRole: 'client', isAllowed: false },
    { myRole: 'staff', counterpartRole: 'staff', isAllowed: false },
    { myRole: 'client', counterpartRole: 'admin', isAllowed: false },
    { myRole: 'client', counterpartRole: 'owner', isAllowed: false },
    { myRole: 'owner', counterpartRole: 'client', isAllowed: false },
    { myRole: 'admin', counterpartRole: 'staff', isAllowed: false },
    { myRole: null, counterpartRole: 'staff', isAllowed: false },
  ])(
    'is $isAllowed when I am $myRole and the other person is $counterpartRole',
    ({ myRole, counterpartRole, isAllowed }) => {
      expect(canBlockPerson({ myRole, counterpartRole })).toBe(isAllowed);
    },
  );
});
