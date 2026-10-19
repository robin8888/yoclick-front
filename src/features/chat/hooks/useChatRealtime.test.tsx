import { QueryClient } from '@tanstack/react-query';
import { act } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { createRealtimeConnection } from '@/shared/realtime/create-realtime-connection';
import { useRealtimeStatusStore } from '@/shared/realtime/realtime-status-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { renderScreen } from '@/test/render-screen';

import { ChatRealtimeBridge } from '../components/ChatRealtimeBridge';

jest.mock('@/shared/realtime/create-realtime-connection', () => ({
  createRealtimeConnection: jest.fn(),
}));
jest.mock('@/shared/api/api-config', () => ({ getApiBaseUrl: () => 'https://api.test' }));
jest.mock('@/shared/auth/default-session-services', () => ({
  getSessionServices: () => ({ refreshAccessToken: () => Promise.resolve('fresh-token') }),
}));

const CONVERSATION_ID = '0191d6a0-0000-7000-8000-0000000000e1';

describe('ChatRealtimeBridge', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const close = jest.fn();

  beforeEach(() => {
    close.mockReset();
    // En Jest la app no declara estar en primer plano: se simula.
    Object.assign(AppState, { currentState: 'active' });
    jest.mocked(createRealtimeConnection).mockReset().mockReturnValue({ close });
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('opens the realtime connection for the active center and closes it on leaving', () => {
    const view = renderScreen(<ChatRealtimeBridge />);

    expect(createRealtimeConnection).toHaveBeenCalledWith(
      expect.objectContaining({ centerId: NORTE_CENTER_ID }),
    );

    view.unmount();

    expect(close).toHaveBeenCalled();
  });

  it('does not connect without a center', () => {
    act(() => {
      useSessionStore.getState().selectActiveCenter(null);
    });

    renderScreen(<ChatRealtimeBridge />);

    expect(createRealtimeConnection).not.toHaveBeenCalled();
  });

  it('reloads the inbox and the thread when a message arrives, with no content in the notice', () => {
    const invalidate = jest.spyOn(QueryClient.prototype, 'invalidateQueries').mockResolvedValue();
    renderScreen(<ChatRealtimeBridge />);
    const options = jest.mocked(createRealtimeConnection).mock.calls[0]?.[0];

    act(() => {
      options?.onEvent({ type: 'chat.updated', conversationId: CONVERSATION_ID });
    });

    expect(invalidate).toHaveBeenCalledTimes(2);
    invalidate.mockRestore();
  });

  it('tells the polling to slow down while it is connected', () => {
    renderScreen(<ChatRealtimeBridge />);
    const options = jest.mocked(createRealtimeConnection).mock.calls[0]?.[0];

    act(() => {
      options?.onConnectedChange(true);
    });

    expect(useRealtimeStatusStore.getState().isConnected).toBe(true);
  });
});
