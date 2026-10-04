import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useReducedMotion } from './useReducedMotion';

type ReduceMotionListener = (isEnabled: boolean) => void;

describe('useReducedMotion', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reads the initial system preference', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

    const { result } = renderHook(() => useReducedMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('follows changes made while the app is open and unsubscribes on unmount', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const removeListener = jest.fn();
    let notifyChange: ReduceMotionListener = jest.fn();
    // addEventListener está sobrecargado por evento; solo nos interesa 'reduceMotionChanged'.
    const addListenerSpy = jest.spyOn(
      AccessibilityInfo,
      'addEventListener',
    ) as unknown as jest.SpyInstance<{ remove: () => void }, [string, ReduceMotionListener]>;
    addListenerSpy.mockImplementation((_eventName, listener) => {
      notifyChange = listener;
      return { remove: removeListener };
    });

    const { result, unmount } = renderHook(() => useReducedMotion());
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
    act(() => {
      notifyChange(true);
    });

    expect(result.current).toBe(true);
    unmount();
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
