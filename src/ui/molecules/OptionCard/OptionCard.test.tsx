import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { OptionCard } from './OptionCard';

describe('OptionCard', () => {
  it('shows the title, the data and the description', () => {
    renderInTheme(
      <OptionCard
        title="Entrenamiento personal"
        meta="60 min · Individual"
        description="Sesión uno a uno"
        isSelected={false}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.getByText('60 min · Individual')).toBeOnTheScreen();
    expect(screen.getByText('Sesión uno a uno')).toBeOnTheScreen();
  });

  it('is a radio that is not checked until it is selected', () => {
    renderInTheme(<OptionCard title="Yoga" isSelected={false} onPress={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Yoga' })).not.toBeChecked();
  });

  it('is checked when it is selected', () => {
    renderInTheme(<OptionCard title="Yoga" isSelected onPress={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Yoga' })).toBeChecked();
  });

  it('reports the tap', () => {
    const onPress = jest.fn();
    renderInTheme(<OptionCard title="Yoga" isSelected={false} onPress={onPress} />);

    fireEvent.press(screen.getByRole('radio', { name: 'Yoga' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
