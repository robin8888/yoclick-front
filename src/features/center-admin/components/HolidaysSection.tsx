import { useState } from 'react';
import { View } from 'react-native';

import type { CenterSettingsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { IconButton } from '@/ui/atoms/IconButton';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';

import { useSaveCenterSettings } from '../hooks/useSaveCenterSettings';
import { buildHolidayList, isValidHolidayDraft, type Holiday } from '../model/holidays';
import { HOLIDAY_ROW_STYLE, HOLIDAYS_STYLE } from './HolidaysSection.styles';

type SaveSettings = ReturnType<typeof useSaveCenterSettings>['saveSettings'];

interface HolidayRowProps {
  holiday: Holiday;
  onRemove: () => void;
}

function HolidayRow({ holiday, onRemove }: Readonly<HolidayRowProps>): React.JSX.Element {
  return (
    <View style={HOLIDAY_ROW_STYLE}>
      <Text variant="bodyStrong">{holiday.date}</Text>
      <Text color="ink2">{holiday.label}</Text>
      <IconButton
        iconName="close"
        variant="tonal"
        accessibilityLabel={i18n.t('centerAdmin.details.holidayRemove', { label: holiday.label })}
        onPress={onRemove}
      />
    </View>
  );
}

interface HolidayAddFormProps {
  holidays: readonly Holiday[];
  saveSettings: SaveSettings;
  isSaving: boolean;
}

function HolidayAddForm({
  holidays,
  saveSettings,
  isSaving,
}: Readonly<HolidayAddFormProps>): React.JSX.Element {
  const [date, setDate] = useState('');
  const [label, setLabel] = useState('');

  return (
    <>
      <Input
        value={date}
        onChangeText={setDate}
        accessibilityLabel={i18n.t('centerAdmin.details.holidayDateLabel')}
        placeholder={i18n.t('centerAdmin.details.holidayDatePlaceholder')}
        keyboardType="numbers-and-punctuation"
      />
      <Input
        value={label}
        onChangeText={setLabel}
        accessibilityLabel={i18n.t('centerAdmin.details.holidayLabelLabel')}
        placeholder={i18n.t('centerAdmin.details.holidayLabelPlaceholder')}
      />
      <Button
        variant="outline"
        leadingIconName="plus"
        label={i18n.t('centerAdmin.details.holidayAddAction')}
        isDisabled={!isValidHolidayDraft({ date, label }, holidays)}
        isLoading={isSaving}
        onPress={() => {
          saveSettings({ holidays: buildHolidayList(holidays, { date, label }) }, () => {
            setDate('');
            setLabel('');
          });
        }}
      />
    </>
  );
}

interface HolidaysSectionProps {
  holidays: CenterSettingsResponseDto['holidays'];
  settingsVersion: string;
}

/** Prototipo `acenter`, «Cierres y festivos»: días en los que no se puede reservar. */
export function HolidaysSection({
  holidays,
  settingsVersion,
}: Readonly<HolidaysSectionProps>): React.JSX.Element {
  const { saveSettings, isSaving } = useSaveCenterSettings(settingsVersion);
  const currentHolidays = holidays ?? [];

  return (
    <View style={HOLIDAYS_STYLE}>
      <Text variant="titleMd">{i18n.t('centerAdmin.details.holidaysTitle')}</Text>
      {currentHolidays.map((holiday) => (
        <HolidayRow
          key={holiday.date}
          holiday={holiday}
          onRemove={() => {
            saveSettings({ holidays: currentHolidays.filter(({ date }) => date !== holiday.date) });
          }}
        />
      ))}
      <HolidayAddForm holidays={currentHolidays} saveSettings={saveSettings} isSaving={isSaving} />
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.details.holidaysHelper')}
      </Text>
    </View>
  );
}
