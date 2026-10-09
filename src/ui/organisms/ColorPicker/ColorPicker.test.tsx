import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  it('has a control for the hue and one for the saturation', () => {
    renderInTheme(
      <ColorPicker
        value="#E4572E"
        onValueChange={jest.fn()}
        accessibilityLabel="Color de la marca"
      />,
    );

    expect(screen.getByLabelText('Tono')).toBeOnTheScreen();
    expect(screen.getByLabelText('Intensidad')).toBeOnTheScreen();
  });

  it('moves the hue with the accessibility actions and gives back a hex color', () => {
    const onValueChange = jest.fn();
    renderInTheme(
      <ColorPicker value="#FF0000" onValueChange={onValueChange} accessibilityLabel="Color" />,
    );

    fireEvent(screen.getByLabelText('Tono'), 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(onValueChange).toHaveBeenCalledWith('#FF2A00');
  });

  it('makes the color less intense with the decrement action', () => {
    const onValueChange = jest.fn();
    renderInTheme(
      <ColorPicker value="#FF0000" onValueChange={onValueChange} accessibilityLabel="Color" />,
    );

    fireEvent(screen.getByLabelText('Intensidad'), 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });

    expect(onValueChange).toHaveBeenCalledWith('#FF0D0D');
  });
});
