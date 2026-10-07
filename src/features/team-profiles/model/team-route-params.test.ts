import { parseTeamMemberRouteParams } from './team-route-params';

const VALID_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789ab';

describe('parseTeamMemberRouteParams', () => {
  it.each([
    { caseName: 'a valid id', params: { membershipId: VALID_ID }, isValid: true },
    { caseName: 'an id that is not a UUID', params: { membershipId: 'marta' }, isValid: false },
    { caseName: 'nothing', params: {}, isValid: false },
    { caseName: 'a list of ids', params: { membershipId: [VALID_ID] }, isValid: false },
  ])('says $isValid for $caseName', ({ params, isValid }) => {
    expect(parseTeamMemberRouteParams(params) !== null).toBe(isValid);
  });
});
