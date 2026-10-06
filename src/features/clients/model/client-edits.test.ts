import { buildClientChanges } from './client-edits';

describe('buildClientChanges', () => {
  it.each([
    ['nothing touched', {}, {}],
    ['a new level', { level: 'advanced' }, { level: 'advanced' }],
    ['no level', { level: '' }, { level: null }],
    ['a new group', { groupId: 'group-1' }, { groupId: 'group-1' }],
    ['no group', { groupId: '' }, { groupId: null }],
    ['both', { level: 'beginner', groupId: 'group-2' }, { level: 'beginner', groupId: 'group-2' }],
  ])('%s', (_caseName, edits, expectedChanges) => {
    expect(buildClientChanges(edits)).toEqual(expectedChanges);
  });
});
