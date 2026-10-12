import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { SpanishDateField } from './SpanishDateField';

interface SchedulePeriodFieldsProps {
  /** Sin fecha de inicio (edición) solo se enseña el fin. */
  startsOn?: string | undefined;
  endsOn: string;
  onStartsOnChange?: ((isoDate: string) => void) | undefined;
  onEndsOnChange: (isoDate: string) => void;
  errorMessage?: string | undefined;
}

const FIELD_STYLE = { gap: 8 } as const;

/** Desde cuándo y, si tiene fin, hasta cuándo se repite el horario. */
export function SchedulePeriodFields({
  startsOn,
  endsOn,
  onStartsOnChange,
  onEndsOnChange,
  errorMessage,
}: Readonly<SchedulePeriodFieldsProps>): React.JSX.Element {
  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.schedules.periodLabel')}</Text>
      {startsOn === undefined || onStartsOnChange === undefined ? null : (
        <>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.schedules.startsOnLabel')}
          </Text>
          <SpanishDateField
            value={startsOn}
            onValueChange={onStartsOnChange}
            accessibilityLabel={i18n.t('centerAdmin.schedules.startsOnLabel')}
          />
        </>
      )}
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.schedules.endsOnLabel')}
      </Text>
      <SpanishDateField
        value={endsOn}
        onValueChange={onEndsOnChange}
        accessibilityLabel={i18n.t('centerAdmin.schedules.endsOnLabel')}
      />
      {errorMessage === undefined ? null : (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
