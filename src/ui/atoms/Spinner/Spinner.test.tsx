import { screen } from '@testing-library/react-native';

import { colorTokens } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('is announced as a busy progress bar when it has a label', () => {
    renderInTheme(<Spinner accessibilityLabel="Cargando tus citas" />);

    expect(screen.getByRole('progressbar', { name: 'Cargando tus citas' })).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: 'Cargando tus citas' })).toBeBusy();
  });

  it('is hidden from screen readers when decorative', () => {
    renderInTheme(<Spinner />);

    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();
  });

  it('uses the brand ink by default and follows the theme mode', () => {
    renderInTheme(<Spinner accessibilityLabel="Cargando" />, {
      mode: 'dark',
      brandHexColor: '#E4572E',
    });

    expect(screen.getByRole('progressbar', { name: 'Cargando' }).props).toMatchObject({
      color: colorTokens.dark.brandInk,
    });
  });

  it('can take a content color for use on filled buttons', () => {
    renderInTheme(<Spinner color="onDanger" size="large" accessibilityLabel="Guardando" />);

    expect(screen.getByRole('progressbar', { name: 'Guardando' }).props).toMatchObject({
      color: colorTokens.light.onDanger,
      size: 'large',
    });
  });
});
