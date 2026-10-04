import { fireEvent, screen } from '@testing-library/react-native';

import { MIN_TOUCH_TARGET_SIZE, buildTheme } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { Switch } from './Switch';

describe('Switch', () => {
  it('is announced as an off switch with its label', () => {
    renderInTheme(
      <Switch isOn={false} onToggle={jest.fn()} accessibilityLabel="Avisos de citas" />,
    );

    expect(screen.getByRole('switch', { name: 'Avisos de citas' })).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Avisos de citas' })).not.toBeChecked();
  });

  it('is announced as checked when on', () => {
    renderInTheme(<Switch isOn onToggle={jest.fn()} accessibilityLabel="Avisos de citas" />);

    expect(screen.getByRole('switch', { name: 'Avisos de citas' })).toBeChecked();
  });

  it('reports the new value when toggled', () => {
    const handleToggle = jest.fn();
    renderInTheme(
      <Switch isOn={false} onToggle={handleToggle} accessibilityLabel="Avisos de citas" />,
    );

    fireEvent(screen.getByRole('switch', { name: 'Avisos de citas' }), 'valueChange', true);

    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it('is announced as disabled when disabled', () => {
    renderInTheme(
      <Switch isOn={false} isDisabled onToggle={jest.fn()} accessibilityLabel="Avisos de citas" />,
    );

    expect(screen.getByRole('switch', { name: 'Avisos de citas' })).toBeDisabled();
  });

  it('keeps a 44 px touch area and brand colors on the track', () => {
    renderInTheme(<Switch isOn onToggle={jest.fn()} accessibilityLabel="Avisos de citas" />, {
      brandHexColor: '#E4572E',
    });

    const { colors } = buildTheme({ mode: 'light', brandHexColor: '#E4572E' });
    expect(screen.getByRole('switch', { name: 'Avisos de citas' }).props).toMatchObject({
      onTintColor: colors.brand,
      thumbTintColor: colors.onBrand,
      tintColor: colors.lineStrong,
    });
    expect(JSON.stringify(screen.toJSON())).toContain(
      `"minHeight":${String(MIN_TOUCH_TARGET_SIZE)}`,
    );
  });
});
