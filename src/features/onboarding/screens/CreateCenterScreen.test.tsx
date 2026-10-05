import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { useCenterCreationIntentStore } from '../model/center-creation-intent-store';
import { useCreatedCenterStore } from '../model/created-center-store';
import { CreateCenterScreen } from './CreateCenterScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CREATED_CENTER = {
  centerId: '0b0cbd0e-7f87-4c43-a5ec-9f5a0b6b5c11',
  ownerMembershipId: '5a6f5d0e-2ae6-4c52-8d7a-0f5b3c5b4a22',
  slug: 'vertice-training',
  name: 'Vértice Training',
  sectorId: 'baile',
  brandColor: '#7A3FE0',
  joinCode: 'VERTI9',
  trialEndsAt: '2026-10-19T10:00:00.000Z',
};

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useCenterCreationIntentStore.getState().startCenterCreation();
    useCreatedCenterStore.getState().clearCreatedCenter();
  });
}

describe('CreateCenterScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('sends the person to create an account first when there is no session', () => {
    act(() => {
      useSessionStore.getState().resetSession();
    });
    renderScreen(<CreateCenterScreen />);

    expect(screen.getByText('redirect:/(auth)/register')).toBeOnTheScreen();
  });

  it('requires a center name before creating it', async () => {
    mockApi({});
    renderScreen(<CreateCenterScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear mi centro' }));

    expect(await screen.findByText('Escribe el nombre de tu centro')).toBeOnTheScreen();
    expect(findApiCall('POST', '/v1/onboarding/centers')).toBeUndefined();
  });

  it('creates the center with the chosen type and color and opens the logo screen', async () => {
    mockApi({
      'POST /v1/onboarding/centers': CREATED_CENTER,
      'GET /v1/me/memberships': { memberships: [] },
    });
    renderScreen(<CreateCenterScreen />);
    fireEvent.changeText(screen.getByLabelText('Nombre del centro'), 'Vértice Training');
    fireEvent.press(screen.getByRole('button', { name: 'Academia de baile' }));
    fireEvent.press(screen.getByRole('button', { name: 'Color #7A3FE0' }));

    fireEvent.press(screen.getByRole('button', { name: 'Crear mi centro' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(onboarding)/logo');
    });
    expect(findApiCall('POST', '/v1/onboarding/centers')?.body).toEqual({
      name: 'Vértice Training',
      sectorId: 'baile',
      brandColor: '#7A3FE0',
    });
    expect(useCreatedCenterStore.getState().createdCenter).toEqual({
      centerId: CREATED_CENTER.centerId,
      name: 'Vértice Training',
      brandColor: '#7A3FE0',
      joinCode: 'VERTI9',
    });
    expect(useSessionStore.getState().activeCenterId).toBe(CREATED_CENTER.centerId);
    expect(useCenterCreationIntentStore.getState().isCenterCreationRequested).toBe(false);
  });

  it('shows the server error and stays on the form', async () => {
    mockApi({
      'POST /v1/onboarding/centers': () => {
        throw buildApiError('NETWORK_ERROR', 0);
      },
    });
    renderScreen(<CreateCenterScreen />);
    fireEvent.changeText(screen.getByLabelText('Nombre del centro'), 'Vértice Training');

    fireEvent.press(screen.getByRole('button', { name: 'Crear mi centro' }));

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
    expect(getMockRouter().replace).not.toHaveBeenCalled();
  });
});
