import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { Chip } from './Chip';

describe('Chip', () => {
  it('is a radio that says whether it is selected', () => {
    renderInTheme(<Chip label="Base" isSelected onPress={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Base', checked: true })).toBeOnTheScreen();
  });

  it('is a checkbox when several can be marked', () => {
    renderInTheme(
      <Chip label="Base" isSelected={false} selectionRole="checkbox" onPress={jest.fn()} />,
    );

    expect(screen.getByRole('checkbox', { name: 'Base', checked: false })).toBeOnTheScreen();
  });

  it('calls onPress when touched', () => {
    const onPress = jest.fn();
    renderInTheme(<Chip label="Base" isSelected={false} onPress={onPress} />);

    fireEvent.press(screen.getByRole('radio', { name: 'Base' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
