import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { formatDurationInMinutes } from '../model/service-summary';
import { DURATION_PRESETS_MINUTES } from '../model/service-form';

interface DurationPresetsProps {
  selectedMinutes: string;
  onMinutesSelect: (minutes: string) => void;
}

const PRESETS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;
const DURATION_BLOCK_STYLE = { gap: 8 } as const;

/** Duraciones habituales de un toque; cualquier otra se escribe en el campo de minutos. */
export function DurationPresets({
  selectedMinutes,
  onMinutesSelect,
}: Readonly<DurationPresetsProps>): React.JSX.Element {
  return (
    <View style={DURATION_BLOCK_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.serviceEditor.durationLabel')}</Text>
      <View style={PRESETS_STYLE}>
        {DURATION_PRESETS_MINUTES.map((presetMinutes) => (
          <Button
            key={presetMinutes}
            size="sm"
            variant={String(presetMinutes) === selectedMinutes ? 'primary' : 'secondary'}
            label={formatDurationInMinutes(presetMinutes)}
            onPress={() => {
              onMinutesSelect(String(presetMinutes));
            }}
          />
        ))}
      </View>
    </View>
  );
}
