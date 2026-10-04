import { act, fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildMembership, FORJA_CENTER_ID, NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { RoleGate } from '../components/RoleGate';
import { SessionGateScreen } from './SessionGateScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'access-token', user: null });
  });
}

describe('SessionGateScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().resetSession();
    });
  });

  it('sends people without a session to the join flow', () => {
    mockApi({});
    renderScreen(<SessionGateScreen />);

    expect(screen.getByText('redirect:/join')).toBeOnTheScreen();
  });

  it.each([
    ['client', '/(client)/(tabs)/home'],
    ['staff', '/(staff)/(tabs)/agenda'],
    ['admin', '/(admin)/(tabs)/agenda'],
    ['owner', '/(admin)/(tabs)/agenda'],
  ] as const)(
    'sends the %s role to %s and makes the center active',
    async (role, expectedRoute) => {
      mockApi({ 'GET /v1/me/memberships': { memberships: [buildMembership({ role })] } });
      signIn();
      renderScreen(<SessionGateScreen />);

      expect(await screen.findByText(`redirect:${expectedRoute}`)).toBeOnTheScreen();
      expect(useSessionStore.getState().activeCenterId).toBe(NORTE_CENTER_ID);
    },
  );

  it('sends people without centers to join one', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    signIn();
    renderScreen(<SessionGateScreen />);

    expect(await screen.findByText('redirect:/join')).toBeOnTheScreen();
  });

  it('offers a retry when the centers cannot be loaded', async () => {
    mockApi({
      'GET /v1/me/memberships': () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    signIn();
    renderScreen(<SessionGateScreen />);

    expect(
      await screen.findByRole('heading', { name: 'No hemos podido abrir tu sesión' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});

describe('RoleGate', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().resetSession();
    });
  });

  it('keeps people without a session out of a role area', () => {
    mockApi({});
    renderScreen(
      <RoleGate allowedKind="client">
        <Text>Zona de cliente</Text>
      </RoleGate>,
    );

    expect(screen.getByText('redirect:/join')).toBeOnTheScreen();
  });

  it('shows the area to the allowed role', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [buildMembership()] } });
    signIn();
    renderScreen(
      <RoleGate allowedKind="client">
        <Text>Zona de cliente</Text>
      </RoleGate>,
    );

    expect(await screen.findByText('Zona de cliente')).toBeOnTheScreen();
  });

  it('redirects another role to the root so it is rerouted', async () => {
    mockApi({
      'GET /v1/me/memberships': {
        memberships: [buildMembership({ centerId: FORJA_CENTER_ID, role: 'staff' })],
      },
    });
    signIn();
    renderScreen(
      <RoleGate allowedKind="client">
        <Text>Zona de cliente</Text>
      </RoleGate>,
    );

    expect(await screen.findByText('redirect:/')).toBeOnTheScreen();
    expect(screen.queryByText('Zona de cliente')).not.toBeOnTheScreen();
  });

  it('retries the centers request after a failure', async () => {
    mockApi({
      'GET /v1/me/memberships': () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    signIn();
    renderScreen(
      <RoleGate allowedKind="client">
        <Text>Zona de cliente</Text>
      </RoleGate>,
    );

    fireEvent.press(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});
