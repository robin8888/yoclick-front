import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createReportCardStyle, KPI_TILE_STYLE } from './ReportCard.styles';

interface InactiveClientsNoticeProps {
  inactiveCount: number;
  clientWord: string;
}

/** Prototipo `areports`: quienes llevan un mes sin cita. Sin campañas todavía, solo el aviso. */
export function InactiveClientsNotice({
  inactiveCount,
  clientWord,
}: Readonly<InactiveClientsNoticeProps>): React.JSX.Element | null {
  const theme = useTheme();
  if (inactiveCount === 0) return null;

  return (
    <View accessible style={[createReportCardStyle(theme), KPI_TILE_STYLE]}>
      <Icon name="users" color="warning" />
      <Text variant="bodyStrong">
        {i18n.t('centerAdmin.reports.inactiveTitle', { count: inactiveCount, clientWord })}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.reports.inactiveHint')}
      </Text>
    </View>
  );
}
