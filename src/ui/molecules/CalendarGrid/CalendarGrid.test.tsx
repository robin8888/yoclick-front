import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { CalendarGrid } from './CalendarGrid';
import type { CalendarGridProps } from './CalendarGrid.types';

const LABELS: CalendarGridProps['labels'] = {
  monthTitle: 'octubre de 2026',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  weekdayInitials: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  describeDay: (isoDate) => `día ${isoDate}`,
};

function renderCalendar(overrides: Partial<CalendarGridProps> = {}) {
  const onDateSelect = jest.fn();
  renderInTheme(
    <CalendarGrid
      visibleMonth={{ year: 2026, month: 10 }}
      onVisibleMonthChange={jest.fn()}
      selectedDate="2026-10-14"
      todayDate="2026-10-14"
      minDate="2026-10-14"
      onDateSelect={onDateSelect}
      labels={LABELS}
      {...overrides}
    />,
  );
  return { onDateSelect };
}

describe('CalendarGrid · days that already passed', () => {
  it('does not let a day before the minimum be chosen', () => {
    const { onDateSelect } = renderCalendar();

    const pastDay = screen.getByRole('button', { name: 'día 2026-10-13' });
    fireEvent.press(pastDay);

    expect(pastDay).toBeDisabled();
    expect(onDateSelect).not.toHaveBeenCalled();
  });

  it('lets the minimum day and the following ones be chosen', () => {
    const { onDateSelect } = renderCalendar();

    fireEvent.press(screen.getByRole('button', { name: 'día 2026-10-20' }));

    expect(onDateSelect).toHaveBeenCalledWith('2026-10-20');
  });

  it('does not go back to a month that has nothing to choose', () => {
    renderCalendar();

    expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mes siguiente' })).toBeEnabled();
  });

  it('lets any day be chosen when there is no minimum', () => {
    const { onDateSelect } = renderCalendar({ minDate: undefined });

    fireEvent.press(screen.getByRole('button', { name: 'día 2026-10-13' }));

    expect(onDateSelect).toHaveBeenCalledWith('2026-10-13');
  });
});
