import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { SpanishDateField } from './SpanishDateField';

interface SchedulePeriodFieldsProps {
  /** Sin fecha de inicio (edición) solo se enseña el fin. */
  startsOn?: string | undefined;
  endsOn: string;
  onStartsOnChange?: ((isoDate: string) => void) | undefined;
  onEndsOnChange: (isoDate: string) => void;
  /** «Esta semana», «2 semanas»…: termina el domingo de la semana n desde la de inicio; `null` = sin fin. */
  onPeriodPresetSelect?: ((weekCount: number | null) => void) | undefined;
  errorMessage?: string | undefined;
}

const FIELD_STYLE = { gap: 8 } as const;

function StartsOnField({
  startsOn,
  onStartsOnChange,
}: Readonly<{ startsOn: string; onStartsOnChange: (isoDate: string) => void }>): React.JSX.Element {
  return (
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
  );
}

/** Duraciones rápidas: por semanas completas (lunes a domingo) o sin fin. */
function listPeriodPresets(): { weekCount: number | null; label: string }[] {
  return [
    { weekCount: 1, label: i18n.t('centerAdmin.schedules.periodOneWeek') },
    { weekCount: 2, label: i18n.t('centerAdmin.schedules.periodTwoWeeks') },
    { weekCount: 3, label: i18n.t('centerAdmin.schedules.periodThreeWeeks') },
    { weekCount: 4, label: i18n.t('centerAdmin.schedules.periodFourWeeks') },
    { weekCount: null, label: i18n.t('centerAdmin.schedules.periodNoEnd') },
  ];
}

const PRESETS_ROW_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

function PeriodPresets({
  onPresetSelect,
}: Readonly<{ onPresetSelect: (weekCount: number | null) => void }>): React.JSX.Element {
  return (
    <View style={PRESETS_ROW_STYLE}>
      {listPeriodPresets().map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          label={preset.label}
          onPress={() => {
            onPresetSelect(preset.weekCount);
          }}
        />
      ))}
    </View>
  );
}

/** Desde cuándo y, si tiene fin, hasta cuándo se repite el horario. */
export function SchedulePeriodFields({
  startsOn,
  endsOn,
  onStartsOnChange,
  onEndsOnChange,
  onPeriodPresetSelect,
  errorMessage,
}: Readonly<SchedulePeriodFieldsProps>): React.JSX.Element {
  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.schedules.periodLabel')}</Text>
      {startsOn === undefined || onStartsOnChange === undefined ? null : (
        <StartsOnField startsOn={startsOn} onStartsOnChange={onStartsOnChange} />
      )}
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.schedules.endsOnLabel')}
      </Text>
      <SpanishDateField
        value={endsOn}
        onValueChange={onEndsOnChange}
        accessibilityLabel={i18n.t('centerAdmin.schedules.endsOnLabel')}
        isInitiallyOpen={false}
      />
      {onPeriodPresetSelect === undefined ? null : (
        <PeriodPresets onPresetSelect={onPeriodPresetSelect} />
      )}
      {errorMessage === undefined ? null : (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
