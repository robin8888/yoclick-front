import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { MyWaitlistResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { WaitlistSessionAction } from './WaitlistSessionAction';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SESSION_ID = '0191d6a0-0000-7000-8000-0000000000c1';
const ENTRY_ID = '0191d6a0-0000-7000-8000-0000000000c2';
const BASE_PATH = `/v1/centers/${NORTE_CENTER_ID}`;

function buildEntry(
  overrides: Partial<MyWaitlistResponseDtoEntriesItem> = {},
): MyWaitlistResponseDtoEntriesItem {
  return {
    id: ENTRY_ID,
    status: 'waiting',
    classSessionId: SESSION_ID,
    createdAt: '2026-10-19T10:00:00.000Z',
    position: 2,
    offerExpiresAt: null,
    session: {
      startsAt: '2026-10-22T16:00:00.000Z',
      endsAt: '2026-10-22T17:00:00.000Z',
      service: { id: 'service-1', name: 'Pilates' },
    },
    ...overrides,
  };
}

describe('WaitlistSessionAction', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('joins the waitlist of a full class', async () => {
    mockApi({
      [`POST ${BASE_PATH}/class-sessions/${SESSION_ID}/waitlist`]: buildEntry(),
      [`GET ${BASE_PATH}/waitlist/mine`]: { entries: [] },
    });
    renderScreen(
      <WaitlistSessionAction
        classSessionId={SESSION_ID}
        entry={undefined}
        timeZone="Europe/Madrid"
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Apuntarme a la lista de espera' }));

    await waitFor(() => {
      expect(
        findApiCall('POST', `${BASE_PATH}/class-sessions/${SESSION_ID}/waitlist`),
      ).toBeDefined();
    });
  });

  it('shows the place in the queue and lets the person leave', async () => {
    mockApi({
      [`POST ${BASE_PATH}/waitlist/${ENTRY_ID}/leave`]: undefined,
      [`GET ${BASE_PATH}/waitlist/mine`]: { entries: [] },
    });
    renderScreen(
      <WaitlistSessionAction
        classSessionId={SESSION_ID}
        entry={buildEntry()}
        timeZone="Europe/Madrid"
      />,
    );

    expect(screen.getByText('En lista de espera · puesto 2')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Salir de la lista' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE_PATH}/waitlist/${ENTRY_ID}/leave`)).toBeDefined();
    });
  });

  it('confirms an offered seat, and says until when it can be confirmed', async () => {
    mockApi({
      [`POST ${BASE_PATH}/waitlist/${ENTRY_ID}/confirm`]: {},
      [`GET ${BASE_PATH}/waitlist/mine`]: { entries: [] },
    });
    const offered = buildEntry({
      status: 'offered',
      position: null,
      offerExpiresAt: '2026-10-20T06:30:00.000Z',
    });
    renderScreen(
      <WaitlistSessionAction
        classSessionId={SESSION_ID}
        entry={offered}
        timeZone="Europe/Madrid"
      />,
    );

    expect(screen.getByText(/Plaza ofrecida · confirma antes del/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'No la quiero' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar plaza' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE_PATH}/waitlist/${ENTRY_ID}/confirm`)).toBeDefined();
    });
  });
});
