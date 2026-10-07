import { useState } from 'react';
import { View } from 'react-native';

import { Input } from '@/ui/atoms/Input';
import { IconButton } from '@/ui/atoms/IconButton';
import { CalendarGrid, readMonthOfIsoDate } from '@/ui/molecules/CalendarGrid';

import { DATE_FIELD_ROW_STYLE, DATE_FIELD_TEXT_STYLE } from './DatePickerField.styles';
import type { DatePickerFieldProps } from './DatePickerField.types';

const DATE_MAX_LENGTH = 10;
const FALLBACK_MONTH = { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };

interface DatePickerState {
  text: string;
  isCalendarOpen: boolean;
  visibleMonth: { year: number; month: number };
  setVisibleMonth: (month: { year: number; month: number }) => void;
  toggleCalendar: () => void;
  changeText: (nextText: string) => void;
  selectDate: (isoDate: string) => void;
}

/** Texto escrito, calendario abierto y mes visible: lo que el campo recuerda entre pulsaciones. */
function useDatePickerState(
  props: Pick<DatePickerFieldProps, 'value' | 'onValueChange' | 'formatDate' | 'parseDate'>,
): DatePickerState {
  const { value, onValueChange, formatDate, parseDate } = props;
  const [text, setText] = useState(formatDate(value));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(readMonthOfIsoDate(value) ?? FALLBACK_MONTH);

  return {
    text,
    isCalendarOpen,
    visibleMonth,
    setVisibleMonth,
    toggleCalendar: () => {
      setIsCalendarOpen((isOpen) => !isOpen);
    },
    changeText: (nextText) => {
      setText(nextText);
      onValueChange(parseDate(nextText) ?? '');
    },
    selectDate: (isoDate) => {
      setText(formatDate(isoDate));
      onValueChange(isoDate);
      setIsCalendarOpen(false);
    },
  };
}

/**
 * Una fecha que se escribe como en España (`23/11/2026`) o se elige en un calendario. Entrega
 * siempre `AAAA-MM-DD`, o cadena vacía mientras lo escrito no sea una fecha que exista.
 */
export function DatePickerField(props: Readonly<DatePickerFieldProps>): React.JSX.Element {
  const { value, accessibilityLabel, placeholder, openCalendarLabel, getCalendarLabels } = props;
  const state = useDatePickerState(props);

  return (
    <View style={DATE_FIELD_TEXT_STYLE}>
      <View style={DATE_FIELD_ROW_STYLE}>
        <View style={DATE_FIELD_TEXT_STYLE}>
          <Input
            value={state.text}
            onChangeText={state.changeText}
            accessibilityLabel={accessibilityLabel}
            placeholder={placeholder}
            keyboardType="numbers-and-punctuation"
            maxLength={DATE_MAX_LENGTH}
            isInvalid={state.text.trim() !== '' && value === ''}
          />
        </View>
        <IconButton
          iconName="calendar"
          variant="tonal"
          accessibilityLabel={openCalendarLabel}
          onPress={state.toggleCalendar}
        />
      </View>
      {state.isCalendarOpen ? (
        <CalendarGrid
          visibleMonth={state.visibleMonth}
          onVisibleMonthChange={state.setVisibleMonth}
          selectedDate={value}
          onDateSelect={state.selectDate}
          labels={getCalendarLabels(state.visibleMonth)}
        />
      ) : null}
    </View>
  );
}
