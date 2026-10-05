import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { TabBar } from './TabBar';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('TabBar', () => {
  it('names each tab and marks the active one as selected', () => {
    renderInTheme(
      <TabBar
        tabs={[
          { id: 'home', label: 'Inicio', iconName: 'home', isActive: true, onPress: jest.fn() },
          {
            id: 'bookings',
            label: 'Citas',
            iconName: 'calendar',
            isActive: false,
            onPress: jest.fn(),
          },
        ]}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Inicio', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Citas', selected: false })).toBeOnTheScreen();
  });

  it('reports the tapped tab', () => {
    const onPress = jest.fn();
    renderInTheme(
      <TabBar
        tabs={[
          { id: 'home', label: 'Inicio', iconName: 'home', isActive: true, onPress: jest.fn() },
          { id: 'bookings', label: 'Citas', iconName: 'calendar', isActive: false, onPress },
        ]}
      />,
    );

    fireEvent.press(screen.getByRole('tab', { name: 'Citas' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
