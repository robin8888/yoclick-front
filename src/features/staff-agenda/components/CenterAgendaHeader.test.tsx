import { act, fireEvent, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { CenterAgendaHeader } from './CenterAgendaHeader';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

describe('CenterAgendaHeader', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows the bell with the unread notices and opens the notices of the administration', async () => {
    mockApi({
      [`GET /v1/centers/${NORTE_CENTER_ID}/notifications`]: { unreadCount: 3, notifications: [] },
    });
    renderScreen(<CenterAgendaHeader dateLabel="vie 9 oct" title="Agenda del centro" />);

    fireEvent.press(await screen.findByRole('button', { name: /3/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/(tabs)/notifications');
  });
});
