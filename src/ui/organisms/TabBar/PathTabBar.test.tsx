import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { PathTabBar } from './PathTabBar';
import type { PathTab } from './TabBar.types';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const TABS: readonly PathTab[] = [
  {
    id: 'home',
    label: 'Inicio',
    iconName: 'home',
    href: '/(client)/(tabs)/home',
    activePaths: ['/home'],
  },
  {
    id: 'book',
    label: 'Reservar',
    iconName: 'plus',
    href: '/(client)/(tabs)/book',
    activePaths: ['/book'],
  },
];

describe('PathTabBar', () => {
  it('keeps the tab selected on the screens that hang from it', () => {
    renderInTheme(<PathTabBar tabs={TABS} currentPath="/book/slot" onTabPress={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Reservar', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Inicio', selected: false })).toBeOnTheScreen();
  });

  it('selects nothing on a route that belongs to no tab', () => {
    renderInTheme(<PathTabBar tabs={TABS} currentPath="/otra" onTabPress={jest.fn()} />);

    expect(screen.queryByRole('tab', { selected: true })).toBeNull();
  });

  it('goes to the tapped tab', () => {
    const onTabPress = jest.fn();
    renderInTheme(<PathTabBar tabs={TABS} currentPath="/home" onTabPress={onTabPress} />);

    fireEvent.press(screen.getByRole('tab', { name: 'Reservar' }));

    expect(onTabPress).toHaveBeenCalledWith('/(client)/(tabs)/book');
  });
});
