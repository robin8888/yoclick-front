import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { CHOICE_CARD_LIST_STYLE, ChoiceCard } from '@/ui/molecules/ChoiceCard';

import { SECTOR_GROUPS } from '../model/sector-groups';
import type { CenterDetailsFormValues } from '../schemas/center-details.schema';
import { SECTOR_GROUP_STYLE, SECTOR_PICKER_STYLE } from './SectorPicker.styles';

interface SectorPickerProps {
  control: Control<CenterDetailsFormValues>;
}

/** Tipo de centro en grupos de tarjetas con selector: el tipo adapta el vocabulario de toda la app. */
export function SectorPicker({ control }: Readonly<SectorPickerProps>): React.JSX.Element {
  return (
    <View style={SECTOR_PICKER_STYLE}>
      <Text variant="bodyStrong">{i18n.t('onboarding.center.sectorLabel')}</Text>
      <Controller
        control={control}
        name="sectorId"
        render={({ field }) => (
          <>
            {SECTOR_GROUPS.map((group) => (
              <View key={group.labelKey} style={SECTOR_GROUP_STYLE}>
                <Text variant="overline" color="ink2">
                  {i18n.t(`onboarding.sectorGroups.${group.labelKey}`)}
                </Text>
                <View style={CHOICE_CARD_LIST_STYLE}>
                  {group.sectorIds.map((sectorId) => (
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
              </View>
            ))}
          </>
        )}
      />
    </View>
  );
}
