import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { isOfflineFromNetInfoState, useNetwork } from './useNetwork';

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { fetch: jest.fn(), addEventListener: jest.fn() },
}));

const mockedNetInfo = jest.mocked(NetInfo);

function createState(
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
): NetInfoState {
  return { isConnected, isInternetReachable } as NetInfoState;
}

describe('isOfflineFromNetInfoState', () => {
  it.each([
    [true, true, false],
    [true, null, false],
    [null, null, false],
    [false, false, true],
    [false, null, true],
    [true, false, true],
  ])(
    'connected=%s reachable=%s → offline=%s',
    (isConnected, isInternetReachable, shouldBeOffline) => {
      expect(isOfflineFromNetInfoState(createState(isConnected, isInternetReachable))).toBe(
        shouldBeOffline,
      );
    },
  );
});

describe('useNetwork', () => {
  it('starts online, reads the current state and follows later changes', async () => {
    let notifyChange: (state: NetInfoState) => void = jest.fn();
    const unsubscribe = jest.fn();
    mockedNetInfo.fetch.mockResolvedValue(createState(false, false));
    mockedNetInfo.addEventListener.mockImplementation((listener) => {
      notifyChange = listener;
      return unsubscribe;
    });

    const { result, unmount } = renderHook(() => useNetwork());

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true);
    });
    act(() => {
      notifyChange(createState(true, true));
    });
    expect(result.current.isOffline).toBe(false);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
