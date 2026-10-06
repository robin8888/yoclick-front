import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { CHOICE_CARD_LIST_STYLE, ChoiceCard } from '@/ui/molecules/ChoiceCard';

import {
  CENTER_TIME_ZONES,
  SECTOR_CHOICE_IDS,
  type CenterDetailsFormValues,
} from '../model/center-details-form';
import { CHOICE_FIELD_STYLE } from './CenterDetailsChoiceFields.styles';

interface ChoiceFieldProps {
  control: Control<CenterDetailsFormValues>;
}

/** Tipo de centro: cambia el vocabulario de toda la app (profesor, alumno, sesión…). */
export function SectorChoiceField({ control }: Readonly<ChoiceFieldProps>): React.JSX.Element {
  return (
    <View style={CHOICE_FIELD_STYLE}>
      <Text variant="titleMd">{i18n.t('centerAdmin.details.sectorTitle')}</Text>
      <Controller
        control={control}
        name="sectorId"
        render={({ field }) => (
          <View style={CHOICE_CARD_LIST_STYLE}>
            {SECTOR_CHOICE_IDS.map((sectorId) => (
              <ChoiceCard
                key={sectorId}
                indicator="radio"
                label={i18n.t(`onboarding.sectors.${sectorId}`)}
                isSelected={field.value === sectorId}
                onPress={() => {
                  field.onChange(sectorId);
                }}
              />
            ))}
          </View>
        )}
      />
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.details.sectorHelper')}
      </Text>
    </View>
  );
}

/** Zona horaria del centro: de ella salen las horas de apertura y de las citas. */
export function TimeZoneChoiceField({ control }: Readonly<ChoiceFieldProps>): React.JSX.Element {
  return (
    <View style={CHOICE_FIELD_STYLE}>
      <Text variant="titleMd">{i18n.t('centerAdmin.details.timezoneTitle')}</Text>
      <Controller
        control={control}
        name="timezone"
        render={({ field }) => (
          <View style={CHOICE_CARD_LIST_STYLE}>
            {CENTER_TIME_ZONES.map((timezone) => (
              <ChoiceCard
                key={timezone}
                indicator="radio"
                label={i18n.t(`centerAdmin.details.timezones.${timezone}`)}
                isSelected={field.value === timezone}
                onPress={() => {
                  field.onChange(timezone);
                }}
              />
            ))}
          </View>
        )}
      />
    </View>
  );
}
