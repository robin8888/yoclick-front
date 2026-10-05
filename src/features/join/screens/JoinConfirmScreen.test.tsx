import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { buildBranding, buildMembership, NORTE_CENTER_ID } from '@/test/factories';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { usePendingCenterStore } from '../model/pending-center-store';
import { JoinConfirmScreen } from './JoinConfirmScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const BRANDING_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/branding`;
const JOIN_PATH = `POST /v1/join/${NORTE_CENTER_ID}`;

describe('JoinConfirmScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    usePendingCenterStore.getState().clearPendingCenter();
    useSessionStore.getState().resetSession();
  });

  it('shows the center and what it will be able to see before joining', async () => {
    mockApi({ [BRANDING_PATH]: buildBranding() });
    renderScreen(<JoinConfirmScreen centerId={NORTE_CENTER_ID} />);

    expect(await screen.findByRole('heading', { name: '¿Es este tu centro?' })).toBeOnTheScreen();
    expect(screen.getByText('Studio Norte')).toBeOnTheScreen();
    expect(screen.getByText(/Studio Norte podrá ver tus datos de perfil/)).toBeOnTheScreen();
  });

  it('without a session keeps the center and sends the person to the welcome screen', async () => {
    mockApi({ [BRANDING_PATH]: buildBranding() });
    usePendingCenterStore.getState().selectPendingCenter({
      id: NORTE_CENTER_ID,
      name: 'Studio Norte',
      sectorId: 'estudio',
      brandHexColor: '#E4572E',
      logoUrl: null,
      joinCode: 'NORTE7',
    });
    renderScreen(<JoinConfirmScreen centerId={NORTE_CENTER_ID} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Unirme a Studio Norte' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/welcome');
    expect(usePendingCenterStore.getState().pendingCenter?.joinCode).toBe('NORTE7');
    expect(findApiCall('POST', '/v1/join')).toBeUndefined();
  });

  it('with a session joins through the API, makes it the active center and goes home', async () => {
    mockApi({
      [BRANDING_PATH]: buildBranding(),
      [JOIN_PATH]: {
        membershipId: 'membership-norte',
        centerId: NORTE_CENTER_ID,
        role: 'client',
        status: 'active',
        isNewMembership: true,
      },
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'access-token', user: null });
    });
    renderScreen(<JoinConfirmScreen centerId={NORTE_CENTER_ID} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Unirme a Studio Norte' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/');
    });
    expect(useSessionStore.getState().activeCenterId).toBe(NORTE_CENTER_ID);
  });

  it('asks for the code when a private center rejects the join', async () => {
    mockApi({
      [BRANDING_PATH]: buildBranding(),
      [JOIN_PATH]: () => {
        throw buildApiError('JOIN_CODE_INVALID', 404);
      },
    });
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'access-token', user: null });
    });
    renderScreen(<JoinConfirmScreen centerId={NORTE_CENTER_ID} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Unirme a Studio Norte' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este centro es privado. Vuelve atrás e introduce su código.',
    );
  });

  it('shows an error with retry when the center cannot be loaded', async () => {
    mockApi({
      [BRANDING_PATH]: () => {
        throw buildApiError('NOT_FOUND', 404);
      },
    });
    renderScreen(<JoinConfirmScreen centerId={NORTE_CENTER_ID} />);

    expect(
      await screen.findByRole('heading', { name: 'No hemos podido cargar el centro' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });

  it('goes back when it is not the person’s center', async () => {
    mockApi({ [BRANDING_PATH]: buildBranding() });
    renderScreen(<JoinConfirmScreen centerId={NORTE_CENTER_ID} />);

    fireEvent.press(await screen.findByRole('button', { name: 'No es mi centro' }));

    expect(getMockRouter().back).toHaveBeenCalled();
  });
});
