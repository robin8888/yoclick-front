import { renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, type PressableStateCallbackType } from 'react-native';

import { usePressableStyle } from './usePressableStyle';

const PRESSED_STATE: PressableStateCallbackType = { pressed: true };
const IDLE_STATE: PressableStateCallbackType = { pressed: false };
const BASE_STYLE = { minHeight: 48 };
const PRESSED_SCALE = 0.97;

describe('usePressableStyle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('scales the element while it is pressed', () => {
    const { result } = renderHook(() =>
      usePressableStyle({ baseStyle: BASE_STYLE, pressedScale: PRESSED_SCALE, isEnabled: true }),
    );

    expect(result.current(PRESSED_STATE)).toEqual({
      minHeight: 48,
      transform: [{ scale: PRESSED_SCALE }],
    });
    expect(result.current(IDLE_STATE)).toEqual(BASE_STYLE);
  });

  it('does not scale a disabled element', () => {
    const { result } = renderHook(() =>
      usePressableStyle({ baseStyle: BASE_STYLE, pressedScale: PRESSED_SCALE, isEnabled: false }),
    );

    expect(result.current(PRESSED_STATE)).toEqual(BASE_STYLE);
  });

  it('does not scale when the user asked for reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const { result } = renderHook(() =>
      usePressableStyle({ baseStyle: BASE_STYLE, pressedScale: PRESSED_SCALE, isEnabled: true }),
    );

    await waitFor(() => {
      expect(result.current(PRESSED_STATE)).toEqual(BASE_STYLE);
    });
  });
});
