import { screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { CenterLogoTile } from './CenterLogoTile';

describe('CenterLogoTile', () => {
  it('shows the initials of the center when it has no logo', () => {
    renderInTheme(<CenterLogoTile centerName="Studio Norte" />);

    expect(screen.getByRole('image', { name: 'Studio Norte' })).toBeOnTheScreen();
    expect(screen.getByText('SN')).toBeOnTheScreen();
  });
});
