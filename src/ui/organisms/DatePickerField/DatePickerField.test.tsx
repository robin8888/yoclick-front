import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/shared/theme';

import { DatePickerField } from './DatePickerField';

/** Lo mínimo que hace falta para probar el campo: el formato real se prueba en `shared/lib/format`. */
const formatNumericDate = (isoDate: string): string => isoDate.split('-').reverse().join('/');

const LABELS = {
  monthTitle: 'noviembre de 2026',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  weekdayInitials: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  describeDay: (isoDate: string) => `día ${isoDate}`,
};

function renderField(onValueChange: jest.Mock, value = '', minDate?: string): void {
  render(
    <ThemeProvider>
      <DatePickerField
        value={value}
        onValueChange={onValueChange}
        formatDate={formatNumericDate}
        accessibilityLabel="Fecha"
        placeholder="Elige una fecha"
        openCalendarLabel="Abrir o cerrar el calendario"
        todayDate="2026-11-20"
        minDate={minDate}
        getCalendarLabels={() => LABELS}
      />
    </ThemeProvider>,
  );
}

describe('DatePickerField', () => {
  it('shows the calendar open and reports the day that is pressed', () => {
    const onValueChange = jest.fn();
    renderField(onValueChange);

    fireEvent.press(screen.getByRole('button', { name: 'día 2026-11-23' }));

    expect(onValueChange).toHaveBeenCalledWith('2026-11-23');
  });

  it('shows the given date the Spanish way in the pill', () => {
    renderField(jest.fn(), '2026-11-23');

    expect(screen.getByText('23/11/2026')).toBeOnTheScreen();
  });

  it('asks to choose a date while there is none', () => {
    renderField(jest.fn());

    expect(screen.getByText('Elige una fecha')).toBeOnTheScreen();
  });

  it('does not let a day before the minimum be chosen', () => {
    const onValueChange = jest.fn();
    renderField(onValueChange, '', '2026-11-20');

    fireEvent.press(screen.getByRole('button', { name: 'día 2026-11-10' }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('closes and opens the calendar from the pill', () => {
    renderField(jest.fn(), '2026-11-23');

    fireEvent.press(screen.getByRole('button', { name: /Fecha: 23\/11\/2026/ }));

    expect(screen.queryByRole('button', { name: 'día 2026-11-23' })).not.toBeOnTheScreen();
  });
});
