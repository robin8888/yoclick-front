import { act, renderHook } from '@testing-library/react-native';

import { useMinAppVersionStore } from './min-app-version-store';
import { useIsAppUpdateRequired } from './useIsAppUpdateRequired';

function announceMinimumVersion(version: string): void {
  act(() => {
    useMinAppVersionStore
      .getState()
      .reportResponseHeaders(new Headers({ 'X-Min-App-Version': version }));
  });
}

describe('useIsAppUpdateRequired', () => {
  beforeEach(() => {
    useMinAppVersionStore.setState({ minimumAppVersion: null });
  });

  it('does not require an update until the API announces a minimum version', () => {
    const { result } = renderHook(() => useIsAppUpdateRequired({ currentAppVersion: '1.0.0' }));

    expect(result.current).toBe(false);
  });

  it('requires an update when the installed version is below the announced minimum', () => {
    const { result } = renderHook(() => useIsAppUpdateRequired({ currentAppVersion: '1.0.0' }));

    announceMinimumVersion('1.2.0');

    expect(result.current).toBe(true);
  });

  it('stops requiring it once the installed version meets the minimum', () => {
    announceMinimumVersion('1.2.0');

    const { result } = renderHook(() => useIsAppUpdateRequired({ currentAppVersion: '1.2.0' }));

    expect(result.current).toBe(false);
  });

  it('uses the injected comparison, so the gate can be tested in isolation', () => {
    const alwaysBelowMinimum = jest.fn(() => true);
    announceMinimumVersion('9.9.9');

    const { result } = renderHook(() =>
      useIsAppUpdateRequired({ currentAppVersion: '1.0.0', isBelowMinimum: alwaysBelowMinimum }),
    );

    expect(result.current).toBe(true);
    expect(alwaysBelowMinimum).toHaveBeenCalledWith('1.0.0', '9.9.9');
  });

  it('ignores responses without the header', () => {
    announceMinimumVersion('1.2.0');

    act(() => {
      useMinAppVersionStore.getState().reportResponseHeaders(new Headers());
    });

    expect(useMinAppVersionStore.getState().minimumAppVersion).toBe('1.2.0');
  });
});
