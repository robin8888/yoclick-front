import { renderHook } from '@testing-library/react-native';
import { useFonts } from 'expo-font';

import { useAppFonts } from './useAppFonts';

jest.mock('expo-font', () => ({ useFonts: jest.fn() }));

const mockedUseFonts = jest.mocked(useFonts);

describe('useAppFonts', () => {
  it('is not ready while fonts are loading', () => {
    mockedUseFonts.mockReturnValue([false, null]);

    expect(renderHook(() => useAppFonts()).result.current.areFontsReady).toBe(false);
  });

  it('is ready once fonts are loaded', () => {
    mockedUseFonts.mockReturnValue([true, null]);

    expect(renderHook(() => useAppFonts()).result.current.areFontsReady).toBe(true);
  });

  it('is ready when loading fails so the app falls back to system fonts', () => {
    mockedUseFonts.mockReturnValue([false, new Error('font failed')]);

    expect(renderHook(() => useAppFonts()).result.current.areFontsReady).toBe(true);
  });
});
