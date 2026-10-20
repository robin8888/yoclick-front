import { act, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { ALL_MODULES_ON, buildMembership, NO_APPEARANCE, NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { ClientTabBar } from './ClientTabBar';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-router', () => ({
  usePathname: () => '/home',
  useRouter: () => ({ navigate: jest.fn() }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

function signInToCenterWithModules(modules: typeof ALL_MODULES_ON): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
  mockApi({
    'GET /v1/me/memberships': {
      memberships: [
        buildMembership({
          center: {
            name: 'Taller Norte',
            slug: 'taller-norte',
            sectorId: 'otro',
            brandColor: '#E4572E',
            logoUrl: null,
            modules,
            appearance: NO_APPEARANCE,
          },
        }),
      ],
    },
  });
}

describe('ClientTabBar', () => {
  it('offers the practice tab to a center that uses content', async () => {
    signInToCenterWithModules(ALL_MODULES_ON);
    renderScreen(<ClientTabBar />);

    expect(await screen.findByRole('tab', { name: /Inicio/ })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: /Practicar/ })).toBeOnTheScreen();
  });

  it('leaves the practice tab out for a center that only gives appointments', async () => {
    signInToCenterWithModules({ ...ALL_MODULES_ON, content: false });
    renderScreen(<ClientTabBar />);

    await waitFor(() => {
      expect(screen.queryByRole('tab', { name: /Practicar/ })).not.toBeOnTheScreen();
    });
    expect(screen.getByRole('tab', { name: /Reservar/ })).toBeOnTheScreen();
  });
});
