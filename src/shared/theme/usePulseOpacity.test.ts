import { renderHook } from '@testing-library/react-native';
import { AccessibilityInfo, Animated } from 'react-native';

import { usePulseOpacity } from './usePulseOpacity';

describe('usePulseOpacity', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts a looping animation while it is active', () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const loopSpy = jest.spyOn(Animated, 'loop');

    const { unmount } = renderHook(() => usePulseOpacity(true));

    expect(loopSpy).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('does not animate when it is not active', () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const loopSpy = jest.spyOn(Animated, 'loop');

    const { result } = renderHook(() => usePulseOpacity(false));

    expect(loopSpy).not.toHaveBeenCalled();
    expect(JSON.stringify(result.current)).toBe('1');
  });
});
