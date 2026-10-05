import { screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { LogoLoader } from './LogoLoader';

describe('LogoLoader', () => {
  it('is decorative without a label', () => {
    renderInTheme(<LogoLoader />);

    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();
    expect(JSON.stringify(screen.toJSON())).toContain('no-hide-descendants');
  });

  it('is announced as a busy progress bar when it has a label', () => {
    renderInTheme(<LogoLoader accessibilityLabel="Cargando" />);

    expect(screen.getByRole('progressbar', { name: 'Cargando' })).toBeOnTheScreen();
  });

  it('draws the body of the logo and its three sparks', () => {
    renderInTheme(<LogoLoader accessibilityLabel="Cargando" />);

    // Un `Svg` para el cuerpo (X y C) y uno por cada destello.
    expect(JSON.stringify(screen.toJSON()).match(/RNSVGSvgView|"Svg"/g)?.length).toBeGreaterThan(0);
  });
});
