import { screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { LoadingScreenTemplate } from './LoadingScreenTemplate';

describe('LoadingScreenTemplate', () => {
  it('announces the loading state once', () => {
    renderInTheme(<LoadingScreenTemplate loadingLabel="Cargando" />);

    expect(screen.getByRole('progressbar', { name: 'Cargando' })).toBeOnTheScreen();
  });
});
