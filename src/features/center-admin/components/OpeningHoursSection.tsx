import { View } from 'react-native';

import type { CenterSettingsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { summarizeOpeningHours } from '../model/opening-hours-summary';
import { createHoursCardStyle, HOURS_ROW_STYLE } from './OpeningHoursSection.styles';
import { SectionHeader } from './SectionHeader';

interface OpeningHoursSectionProps {
  openingHours: CenterSettingsResponseDto['openingHours'];
}

/** El horario de apertura del centro, un día por fila; «Cerrado» con palabra, no solo atenuado. */
export function OpeningHoursSection({
  openingHours,
}: Readonly<OpeningHoursSectionProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space[3] }}>
      <SectionHeader title={i18n.t('centerAdmin.services.hoursTitle')} />
      <View style={createHoursCardStyle(theme)}>
        {summarizeOpeningHours(openingHours).map(({ day, rangesLabel }) => (
          <View key={day} style={HOURS_ROW_STYLE}>
            <Text color="ink2">{i18n.t(`centerAdmin.weekDays.${day}`)}</Text>
            <Text variant="bodyStrong">{rangesLabel ?? i18n.t('centerAdmin.services.closed')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
