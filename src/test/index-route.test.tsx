import { render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/shared/theme';

import IndexRoute from '../../app/index';

describe('index route', () => {
  it('renders the Yoclick heading', () => {
    render(
      <ThemeProvider>
        <IndexRoute />
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Yoclick' })).toBeOnTheScreen();
  });
});
