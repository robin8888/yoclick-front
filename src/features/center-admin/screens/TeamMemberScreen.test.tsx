import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { TeamMemberScreen } from './TeamMemberScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const MEMBERSHIP_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789ab';
const TEAM_PATH = `/v1/centers/${NORTE_CENTER_ID}/team`;

function buildMember(role: 'staff' | 'admin', permissions: string[]): object {
  return {
    membershipId: MEMBERSHIP_ID,
    userId: '0198f2a0-7c11-7aaa-8bbb-0123456789ac',
    fullName: 'Marta Gil',
    email: 'marta@example.test',
    role,
    status: 'active',
    staffTitle: 'Entrenadora',
    permissions,
    joinedAt: '2026-09-01T10:00:00.000Z',
  };
}

function mockTeam(member: object): void {
  mockApi({
    'GET /v1/me/memberships': { memberships: [] },
    [`GET ${TEAM_PATH}`]: { members: [member] },
    [`PATCH ${TEAM_PATH}/${MEMBERSHIP_ID}`]: member,
  });
}

describe('TeamMemberScreen permissions', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
    jest.mocked(useLocalSearchParams).mockReturnValue({ membershipId: MEMBERSHIP_ID });
  });

  it('shows what the staff member can already do and lets the center give more', async () => {
    mockTeam(buildMember('staff', ['reports:view']));
    renderScreen(<TeamMemberScreen />);

    expect(await screen.findByRole('switch', { name: 'Ver los informes' })).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Ver los informes' })).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ checked: true }),
    );
    expect(screen.getByRole('switch', { name: /Gestionar servicios/ })).toBeOnTheScreen();
  });

  it('sends the whole permission list when one is turned on and saved', async () => {
    mockTeam(buildMember('staff', ['reports:view']));
    renderScreen(<TeamMemberScreen />);

    fireEvent(
      await screen.findByRole('switch', { name: /Gestionar servicios/ }),
      'valueChange',
      true,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', `${TEAM_PATH}/${MEMBERSHIP_ID}`)?.body).toEqual({
        permissions: ['reports:view', 'services:manage'],
      });
    });
  });

  it('does not offer permissions to administration, which already sees everything', async () => {
    mockTeam(buildMember('admin', []));
    renderScreen(<TeamMemberScreen />);

    await screen.findByText('Marta Gil');

    expect(screen.queryByText('Qué más puede hacer')).not.toBeOnTheScreen();
  });
});
