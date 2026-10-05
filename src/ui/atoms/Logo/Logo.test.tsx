import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ThemeProvider, type ThemeMode } from '@/shared/theme';

import { Logo } from './Logo';

function renderInTheme(element: ReactElement, mode: ThemeMode = 'light'): void {
  render(<ThemeProvider initialPreference={mode}>{element}</ThemeProvider>);
}

describe('Logo', () => {
  it('is announced as an image named YoClick', () => {
    renderInTheme(<Logo variant="symbol" height={72} />);

    expect(screen.getByRole('img', { name: 'YoClick' })).toBeOnTheScreen();
  });

  it.each(['light', 'dark'] as const)('renders the wordmark in %s mode', (mode) => {
    renderInTheme(<Logo variant="wordmark" height={22} />, mode);

    expect(screen.getByRole('img', { name: 'YoClick' })).toBeOnTheScreen();
  });

  it('renders the white lockup as an image named YoClick', () => {
    renderInTheme(<Logo variant="lockup" height={160} />);

    expect(screen.getByRole('img', { name: 'YoClick' })).toBeOnTheScreen();
  });
});
