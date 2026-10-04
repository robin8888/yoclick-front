import { render, screen } from '@testing-library/react-native';

import IndexRoute from '../../app/index';

describe('index route', () => {
  it('renders the Yoclick heading', () => {
    render(<IndexRoute />);

    expect(screen.getByRole('heading', { name: 'Yoclick' })).toBeOnTheScreen();
  });
});
