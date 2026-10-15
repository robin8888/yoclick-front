import { act, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { MyChildrenScreen } from './MyChildrenScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CHILD_ID = '0198f4a0-0000-7000-8000-000000000041';
const BASE = `/v1/centers/${NORTE_CENTER_ID}`;

describe('guardians', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows a guardian their children with the next class and what is left', async () => {
    mockApi({
      [`GET ${BASE}/guardians/me/children`]: {
        children: [
          {
            membershipId: CHILD_ID,
            fullName: 'Lucía Pérez',
            photoUrl: null,
            isMinor: true,
            remainingSessions: 4,
            upcomingBookings: [
              {
                id: '0198f4a0-0000-7000-8000-000000000043',
                serviceName: 'Karate infantil',
                startsAt: '2026-10-20T16:00:00.000Z',
                teacherName: 'Marta',
              },
            ],
          },
        ],
      },
    });
    renderScreen(<MyChildrenScreen />);

    expect(await screen.findByText('Lucía Pérez')).toBeOnTheScreen();
    expect(screen.getByText('Le quedan 4 clases')).toBeOnTheScreen();
    expect(screen.getByText(/Karate infantil/)).toBeOnTheScreen();
  });

  it('says so when nobody is in their care', async () => {
    mockApi({ [`GET ${BASE}/guardians/me/children`]: { children: [] } });
    renderScreen(<MyChildrenScreen />);

    expect(await screen.findByText('Aún no tienes a nadie a tu cargo')).toBeOnTheScreen();
  });
});
