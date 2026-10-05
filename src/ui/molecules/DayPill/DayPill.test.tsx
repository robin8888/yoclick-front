import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { DayPill } from './DayPill';

const BASE_PROPS = {
  weekdayLabel: 'jue',
  dayLabel: '1',
  accessibilityLabel: 'jueves 1 de octubre',
} as const;

describe('DayPill', () => {
  it('is named by the full date and reports whether it is selected', () => {
    renderInTheme(<DayPill {...BASE_PROPS} isSelected hasSlots onPress={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: 'jueves 1 de octubre', selected: true }),
    ).toBeOnTheScreen();
  });

  it('calls onPress when the day has slots', () => {
    const onPress = jest.fn();
    renderInTheme(<DayPill {...BASE_PROPS} isSelected={false} hasSlots onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'jueves 1 de octubre' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the day has no slots', () => {
    renderInTheme(
      <DayPill {...BASE_PROPS} isSelected={false} hasSlots={false} onPress={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'jueves 1 de octubre' })).toBeDisabled();
  });
});
