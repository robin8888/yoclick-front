import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import type { ScheduleMode } from '../model/schedule-form';

interface ScheduleModeFieldProps {
  allowedModes: readonly ScheduleMode[];
  selectedMode: ScheduleMode;
  onModeChange: (mode: ScheduleMode) => void;
}

const FIELD_STYLE = { gap: 8 } as const;

const MODE_LABEL_KEYS = {
  private: 'centerAdmin.schedules.modePrivate',
  group: 'centerAdmin.schedules.modeGroup',
} as const;

/** Privado o en grupo; si el servicio solo admite uno, se dice con palabras en vez de elegir. */
export function ScheduleModeField({
  allowedModes,
  selectedMode,
  onModeChange,
}: Readonly<ScheduleModeFieldProps>): React.JSX.Element {
  const onlyMode = allowedModes.length === 1 ? allowedModes[0] : undefined;

  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.schedules.modeLabel')}</Text>
      {onlyMode === undefined ? (
        <SegmentedControl<ScheduleMode>
          options={allowedModes.map((mode) => ({
            value: mode,
            label: i18n.t(MODE_LABEL_KEYS[mode]),
          }))}
          selectedValue={selectedMode}
          onValueChange={onModeChange}
        />
      ) : (
        <Text color="ink2">
          {i18n.t(
            onlyMode === 'private'
              ? 'centerAdmin.schedules.modeOnlyPrivate'
              : 'centerAdmin.schedules.modeOnlyGroup',
          )}
        </Text>
      )}
    </View>
  );
}
