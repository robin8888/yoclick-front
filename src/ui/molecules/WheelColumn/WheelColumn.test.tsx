import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { WheelColumn } from './WheelColumn';

const OPTIONS = [
  { value: '09', label: '09', accessibilityLabel: '09 h' },
  { value: '10', label: '10', accessibilityLabel: '10 h' },
  { value: '11', label: '11', accessibilityLabel: '11 h' },
];

describe('WheelColumn', () => {
  it('marks the chosen option and announces the others as not selected', () => {
    renderInTheme(
      <WheelColumn
        options={OPTIONS}
        selectedValue="10"
        accessibilityLabel="Hora"
        onValueChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '10 h' })).toBeSelected();
    expect(screen.getByRole('button', { name: '11 h' })).not.toBeSelected();
  });

  it('chooses an option when it is tapped', () => {
    const onValueChange = jest.fn();
    renderInTheme(
      <WheelColumn
        options={OPTIONS}
        selectedValue="09"
        accessibilityLabel="Hora"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: '11 h' }));

    expect(onValueChange).toHaveBeenCalledWith('11');
  });

  it('chooses the option that stops under the band when the wheel is released', () => {
    const onValueChange = jest.fn();
    renderInTheme(
      <WheelColumn
        options={OPTIONS}
        selectedValue="09"
        accessibilityLabel="Hora"
        onValueChange={onValueChange}
      />,
    );

    fireEvent(screen.getByLabelText('Hora').children[1] as never, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { y: 44 } },
    });

    expect(onValueChange).toHaveBeenCalledWith('10');
  });
});
