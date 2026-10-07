import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/shared/theme';

import { DatePickerField } from './DatePickerField';

/** Lo mínimo que hace falta para probar el campo: el formato real se prueba en `shared/lib/format`. */
const formatNumericDate = (isoDate: string): string => isoDate.split('-').reverse().join('/');
const parseNumericDate = (text: string): string | null =>
  text === '23/11/2026' ? '2026-11-23' : null;

const LABELS = {
  monthTitle: 'noviembre de 2026',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  weekdayInitials: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  describeDay: (isoDate: string) => `día ${isoDate}`,
};

function renderField(onValueChange: jest.Mock, value = ''): void {
  render(
    <ThemeProvider>
      <DatePickerField
        value={value}
        onValueChange={onValueChange}
        formatDate={formatNumericDate}
        parseDate={parseNumericDate}
        accessibilityLabel="Fecha"
        placeholder="DD/MM/AAAA"
        openCalendarLabel="Elegir en el calendario"
        getCalendarLabels={() => LABELS}
      />
    </ThemeProvider>,
  );
}

describe('DatePickerField', () => {
  it('reports an ISO date when a Spanish date is typed', () => {
    const onValueChange = jest.fn();
    renderField(onValueChange);

    fireEvent.changeText(screen.getByLabelText('Fecha'), '23/11/2026');

    expect(onValueChange).toHaveBeenLastCalledWith('2026-11-23');
  });

  it('reports an empty value while what is typed is not a date', () => {
    const onValueChange = jest.fn();
    renderField(onValueChange);

    fireEvent.changeText(screen.getByLabelText('Fecha'), '31/04/2026');

    expect(onValueChange).toHaveBeenLastCalledWith('');
  });

  it('shows the given date the Spanish way', () => {
    renderField(jest.fn(), '2026-11-23');

    expect(screen.getByDisplayValue('23/11/2026')).toBeOnTheScreen();
  });

  it('picks a day in the calendar and closes it', () => {
    const onValueChange = jest.fn();
    renderField(onValueChange, '2026-11-23');

    fireEvent.press(screen.getByRole('button', { name: 'Elegir en el calendario' }));
    fireEvent.press(screen.getByRole('button', { name: 'día 2026-11-27' }));

    expect(onValueChange).toHaveBeenLastCalledWith('2026-11-27');
    expect(screen.queryByText('noviembre de 2026')).toBeNull();
    expect(screen.getByDisplayValue('27/11/2026')).toBeOnTheScreen();
  });
});
