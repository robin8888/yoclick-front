import { fireEvent, screen } from '@testing-library/react-native';
import { Image } from 'expo-image';

import { colorTokens } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { Avatar } from './Avatar';
import { AVATAR_PIXEL_SIZES } from './Avatar.styles';
import { getInitials } from './get-initials';

describe('getInitials', () => {
  it.each([
    ['Marta Gil', 'MG'],
    ['Marta Gil Ortega', 'MG'],
    ['  lucía   ferrer ', 'LF'],
    ['Álex', 'Á'],
    ['Zoë Ñandú', 'ZÑ'],
    ['', '?'],
    ['   ', '?'],
  ])('turns «%s» into «%s»', (fullName, expectedInitials) => {
    expect(getInitials(fullName)).toBe(expectedInitials);
  });
});

describe('Avatar', () => {
  it('shows the initials on surface2 when there is no photo', () => {
    renderInTheme(<Avatar name="Marta Gil" />);

    expect(screen.getByText('MG')).toBeOnTheScreen();
    expect(JSON.stringify(screen.toJSON())).toContain(colorTokens.light.surface2);
  });

  it('is announced as an image named after the person', () => {
    renderInTheme(<Avatar name="Marta Gil" />);

    expect(screen.getByRole('img', { name: 'Marta Gil' })).toBeOnTheScreen();
  });

  it('can be hidden from screen readers when the name is already next to it', () => {
    renderInTheme(<Avatar name="Marta Gil" isDecorative />);

    expect(screen.queryByRole('img')).not.toBeOnTheScreen();
  });

  it('shows the photo instead of the initials when there is a url', () => {
    renderInTheme(<Avatar name="Marta Gil" photoUrl="https://cdn.yoclick.test/marta.jpg" />);

    expect(screen.UNSAFE_getByType(Image).props).toMatchObject({
      source: { uri: 'https://cdn.yoclick.test/marta.jpg' },
      contentFit: 'cover',
    });
    expect(screen.queryByText('MG')).not.toBeOnTheScreen();
  });

  it('falls back to the initials when the photo fails to load', () => {
    renderInTheme(<Avatar name="Marta Gil" photoUrl="https://cdn.yoclick.test/broken.jpg" />);

    fireEvent(screen.UNSAFE_getByType(Image), 'error');

    expect(screen.getByText('MG')).toBeOnTheScreen();
  });

  it.each([null, undefined, ''])('treats photoUrl %j as no photo', (photoUrl) => {
    renderInTheme(<Avatar name="Marta Gil" photoUrl={photoUrl} />);

    expect(screen.getByText('MG')).toBeOnTheScreen();
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('draws a %s circle', (size) => {
    renderInTheme(<Avatar name="Marta Gil" size={size} />);

    expect(screen.getByRole('img', { name: 'Marta Gil' })).toHaveStyle({
      width: AVATAR_PIXEL_SIZES[size],
      height: AVATAR_PIXEL_SIZES[size],
      borderRadius: 999,
    });
  });
});
