import {
  addClient,
  buildAssignmentTargets,
  buildDraftFromAssignments,
  EMPTY_ASSIGNMENT_DRAFT,
  removeClient,
  toggleGroup,
  toggleLevel,
} from './assignment-draft';

const IRENE = { membershipId: 'membership-irene', name: 'Irene Castro' };

describe('assignment draft', () => {
  it('marks and unmarks a level', () => {
    const marked = toggleLevel(EMPTY_ASSIGNMENT_DRAFT, 'intermediate');

    expect(marked.levels).toEqual(['intermediate']);
    expect(toggleLevel(marked, 'intermediate').levels).toEqual([]);
  });

  it('marks and unmarks a group', () => {
    const marked = toggleGroup(EMPTY_ASSIGNMENT_DRAFT, 'group-1');

    expect(marked.groupIds).toEqual(['group-1']);
    expect(toggleGroup(marked, 'group-1').groupIds).toEqual([]);
  });

  it('adds a client once and removes it', () => {
    const added = addClient(addClient(EMPTY_ASSIGNMENT_DRAFT, IRENE), IRENE);

    expect(added.clients).toEqual([IRENE]);
    expect(removeClient(added, IRENE.membershipId).clients).toEqual([]);
  });

  it('builds the list of targets for the server, levels first', () => {
    const draft = addClient(
      toggleGroup(toggleLevel(EMPTY_ASSIGNMENT_DRAFT, 'beginner'), 'group-1'),
      IRENE,
    );

    expect(buildAssignmentTargets(draft)).toEqual([
      { kind: 'level', level: 'beginner' },
      { kind: 'group', groupId: 'group-1' },
      { kind: 'client', membershipId: 'membership-irene' },
    ]);
  });

  it('sends an empty list when nothing is marked, which unassigns', () => {
    expect(buildAssignmentTargets(EMPTY_ASSIGNMENT_DRAFT)).toEqual([]);
  });

  it('reopens with what is already assigned marked', () => {
    const draft = buildDraftFromAssignments([
      { id: 'a1', level: 'advanced', groupId: null, clientMembershipId: null, label: null },
      { id: 'a2', level: null, groupId: 'group-1', clientMembershipId: null, label: 'Mañanas' },
      {
        id: 'a3',
        level: null,
        groupId: null,
        clientMembershipId: IRENE.membershipId,
        label: IRENE.name,
      },
    ]);

    expect(draft).toEqual({ levels: ['advanced'], groupIds: ['group-1'], clients: [IRENE] });
  });
});
