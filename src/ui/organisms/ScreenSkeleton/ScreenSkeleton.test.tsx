import { act, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { ScreenSkeleton } from './ScreenSkeleton';
import { SKELETON_DELAY_MS } from './ScreenSkeleton.styles';

describe('ScreenSkeleton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('draws nothing during the first 300 ms so fast loads do not flash', () => {
    renderInTheme(<ScreenSkeleton loadingLabel="Cargando tus citas" />);

    act(() => {
      jest.advanceTimersByTime(SKELETON_DELAY_MS - 1);
    });

    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();
  });

  it('appears once the load has taken longer than 300 ms', () => {
    renderInTheme(<ScreenSkeleton loadingLabel="Cargando tus citas" />);

    act(() => {
      jest.advanceTimersByTime(SKELETON_DELAY_MS);
    });

    expect(screen.getByRole('progressbar', { name: 'Cargando tus citas' })).toBeOnTheScreen();
  });

  it('is announced once as busy, not once per placeholder block', () => {
    renderInTheme(<ScreenSkeleton loadingLabel="Cargando tus citas" />);

    act(() => {
      jest.advanceTimersByTime(SKELETON_DELAY_MS);
    });

    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.getByRole('progressbar')).toBeBusy();
  });

  it('draws one row per requested row count plus the header', () => {
    renderInTheme(<ScreenSkeleton loadingLabel="Cargando" rowCount={2} />);

    act(() => {
      jest.advanceTimersByTime(SKELETON_DELAY_MS);
    });

    // cabecera (1) + por fila: avatar, línea principal y línea secundaria (3)
    const renderedTree = JSON.stringify(screen.toJSON());
    expect(renderedTree.split('no-hide-descendants').length - 1).toBe(1 + 2 * 3);
  });

  it('accepts a custom delay', () => {
    renderInTheme(<ScreenSkeleton loadingLabel="Cargando" delayMs={50} />);

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(screen.getByRole('progressbar', { name: 'Cargando' })).toBeOnTheScreen();
  });

  it('does not update state after unmounting before the delay', () => {
    const { unmount } = renderInTheme(<ScreenSkeleton loadingLabel="Cargando" />);

    unmount();

    expect(() => {
      act(() => {
        jest.advanceTimersByTime(SKELETON_DELAY_MS);
      });
    }).not.toThrow();
  });
});
