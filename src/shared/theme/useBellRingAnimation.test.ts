import { renderHook } from '@testing-library/react-native';
import { AccessibilityInfo, Animated } from 'react-native';

import { useBellRingAnimation } from './useBellRingAnimation';

describe('useBellRingAnimation', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts one looping ring while there is something unread', () => {
    const loopSpy = jest.spyOn(Animated, 'loop');

    const { unmount } = renderHook(() => useBellRingAnimation(true));

    expect(loopSpy).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('stays still when there is nothing unread', () => {
    const loopSpy = jest.spyOn(Animated, 'loop');

    renderHook(() => useBellRingAnimation(false));

    expect(loopSpy).not.toHaveBeenCalled();
  });

  it('gives two ripples that start hidden', () => {
    const { result } = renderHook(() => useBellRingAnimation(false));

    expect(result.current.rippleProgress).toHaveLength(2);
    expect(JSON.stringify(result.current.rippleProgress[0])).toBe('0');
    expect(JSON.stringify(result.current.popScale)).toBe('1');
  });

  it('resets each ripple to hidden at the start of every ring, so it shows on every ring', () => {
    const timingSpy = jest.spyOn(Animated, 'timing');

    const { result, unmount } = renderHook(() => useBellRingAnimation(true));

    // `Animated.loop` no reinicia los valores del driver nativo: sin este reinicio explícito la onda
    // se quedaría desvanecida (en 1) tras la primera vuelta.
    const resetsByRipple = result.current.rippleProgress.map(
      (progress) =>
        timingSpy.mock.calls.filter(
          ([value, config]) => value === progress && config.toValue === 0 && config.duration === 0,
        ).length,
    );
    expect(resetsByRipple).toEqual([1, 1]);
    unmount();
  });
});
