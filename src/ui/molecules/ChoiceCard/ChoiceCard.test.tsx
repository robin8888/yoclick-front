import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { ChoiceCard } from './ChoiceCard';

describe('ChoiceCard', () => {
  it('is a button named after its label and reports whether it is selected', () => {
    renderInTheme(<ChoiceCard label="Gimnasio" indicator="radio" isSelected onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Gimnasio', selected: true })).toBeOnTheScreen();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    renderInTheme(
      <ChoiceCard
        label="Yoga y pilates"
        indicator="checkbox"
        isSelected={false}
        onPress={onPress}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Yoga y pilates', selected: false }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
