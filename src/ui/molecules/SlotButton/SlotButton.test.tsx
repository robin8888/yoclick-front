import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { SlotButton } from './SlotButton';

describe('SlotButton', () => {
  it('is a button named after its time and reports whether it is selected', () => {
    renderInTheme(<SlotButton timeLabel="18:00" isSelected={false} onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: '18:00', selected: false })).toBeOnTheScreen();
  });

  it('shows a check mark when selected, so selection is not only a color', () => {
    renderInTheme(<SlotButton timeLabel="18:00" isSelected onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: '18:00', selected: true })).toBeOnTheScreen();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    renderInTheme(<SlotButton timeLabel="18:00" isSelected={false} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: '18:00' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
