import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'upcoming', label: 'Próximas' },
  { value: 'past', label: 'Historial' },
] as const;

describe('SegmentedControl', () => {
  it('marks the selected option as selected for the screen reader', () => {
    renderInTheme(
      <SegmentedControl options={OPTIONS} selectedValue="upcoming" onValueChange={jest.fn()} />,
    );

    expect(screen.getByRole('tab', { name: 'Próximas', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Historial', selected: false })).toBeOnTheScreen();
  });

  it('reports the tapped option', () => {
    const onValueChange = jest.fn();
    renderInTheme(
      <SegmentedControl options={OPTIONS} selectedValue="upcoming" onValueChange={onValueChange} />,
    );

    fireEvent.press(screen.getByRole('tab', { name: 'Historial' }));

    expect(onValueChange).toHaveBeenCalledWith('past');
  });
});
