import { fireEvent, screen } from '@testing-library/react-native';

import { MIN_TOUCH_TARGET_SIZE } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { ListItem } from './ListItem';

describe('ListItem', () => {
  it('reads title and subtitle together as one button', () => {
    renderInTheme(<ListItem title="Studio Norte" subtitle="Madrid" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Studio Norte. Madrid' })).toBeOnTheScreen();
  });

  it('calls onPress when tapped', () => {
    const handlePress = jest.fn();
    renderInTheme(<ListItem title="Studio Norte" onPress={handlePress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Studio Norte' }));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('marks the selected row for assistive technology', () => {
    renderInTheme(<ListItem title="Studio Norte" isSelected onPress={jest.fn()} />);

    expect(screen.getByRole('button', { selected: true })).toBeOnTheScreen();
  });

  it('keeps a touch target of at least 44 points', () => {
    renderInTheme(<ListItem title="Studio Norte" onPress={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveStyle({ minHeight: MIN_TOUCH_TARGET_SIZE });
  });
});
