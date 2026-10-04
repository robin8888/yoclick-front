import { act, fireEvent, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildApiError, mockApi } from '@/test/mock-api';
import { buildMembership, FORJA_CENTER_ID, NORTE_CENTER_ID } from '@/test/factories';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { MyCentersScreen } from './MyCentersScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const FORJA_MEMBERSHIP = buildMembership({
  membershipId: 'membership-forja',
  centerId: FORJA_CENTER_ID,
  center: { name: 'Forja', slug: 'forja', sectorId: 'readap', brandColor: '#2446C7' },
});

describe('MyCentersScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().resetSession();
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('lists my centers and marks the current one', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [buildMembership(), FORJA_MEMBERSHIP] } });
    renderScreen(<MyCentersScreen />);

    expect(
      await screen.findByRole('button', { name: 'Studio Norte. Centro actual', selected: true }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Forja', selected: false })).toBeOnTheScreen();
  });

  it('switches the active center and goes back to the root', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [buildMembership(), FORJA_MEMBERSHIP] } });
    renderScreen(<MyCentersScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Forja' }));

    expect(useSessionStore.getState().activeCenterId).toBe(FORJA_CENTER_ID);
    expect(getMockRouter().replace).toHaveBeenCalledWith('/');
  });

  it('invites to join a center when there is none', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    renderScreen(<MyCentersScreen />);

    expect(
      await screen.findByRole('heading', { name: 'Aún no estás en ningún centro' }),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Unirme a un centro' }));
    expect(getMockRouter().push).toHaveBeenCalledWith('/join');
  });

  it('offers a retry when the centers cannot be loaded', async () => {
    mockApi({
      'GET /v1/me/memberships': () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<MyCentersScreen />);

    expect(
      await screen.findByRole('heading', { name: 'No hemos podido cargar tus centros' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});
