import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { CalendarGrid, readMonthOfIsoDate } from '@/ui/molecules/CalendarGrid';

import { createDatePillStyle, DATE_FIELD_STYLE } from './DatePickerField.styles';
import type { DatePickerFieldProps } from './DatePickerField.types';

const FALLBACK_MONTH = { year: 2026, month: 1 };

/** El mes que enseña el calendario al abrirse: el de la fecha elegida o, si no hay, el de hoy. */
function resolveInitialMonth(props: Pick<DatePickerFieldProps, 'value' | 'todayDate'>) {
  return (
    readMonthOfIsoDate(props.value) ?? readMonthOfIsoDate(props.todayDate ?? '') ?? FALLBACK_MONTH
  );
}

/**
 * Una fecha elegida en un calendario como el del iPhone: una píldora con la fecha y, debajo, el mes
 * en rejilla (abierto por defecto; la píldora lo cierra y lo abre). Entrega `AAAA-MM-DD`.
 */
export function DatePickerField(props: Readonly<DatePickerFieldProps>): React.JSX.Element {
  const { value, formatDate, accessibilityLabel, placeholder, openCalendarLabel } = props;
  const theme = useTheme();
  const [isCalendarOpen, setIsCalendarOpen] = useState(props.isInitiallyOpen ?? true);
  const [visibleMonth, setVisibleMonth] = useState(() => resolveInitialMonth(props));
  const dateLabel = value === '' ? placeholder : formatDate(value);

  return (
    <View style={DATE_FIELD_STYLE}>
      <Pressable
        role="button"
        accessibilityLabel={`${accessibilityLabel}: ${dateLabel}. ${openCalendarLabel}`}
        accessibilityState={{ expanded: isCalendarOpen }}
        onPress={() => {
          setIsCalendarOpen((isOpen) => !isOpen);
        }}
        style={createDatePillStyle(theme)}
      >
        <Icon name="calendar" size="inline" color="brandInk" />
        <Text variant="bodyStrong" color={value === '' ? 'ink2' : 'ink'}>
          {dateLabel}
        </Text>
      </Pressable>
      {isCalendarOpen ? (
        <CalendarGrid
          visibleMonth={visibleMonth}
          onVisibleMonthChange={setVisibleMonth}
          selectedDate={value}
          todayDate={props.todayDate}
          minDate={props.minDate}
          onDateSelect={props.onValueChange}
          labels={props.getCalendarLabels(visibleMonth)}
        />
      ) : null}
    </View>
  );
}
