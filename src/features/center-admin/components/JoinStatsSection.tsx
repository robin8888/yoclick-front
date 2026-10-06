import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { useJoinStats } from '../hooks/useJoinStats';
import { JOIN_STATS_ROW_STYLE, createJoinStatStyle } from './JoinStatsSection.styles';

interface JoinStatProps {
  value: number;
  caption: string;
}

function JoinStat({ value, caption }: Readonly<JoinStatProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${String(value)} ${caption}`}
      style={createJoinStatStyle(theme)}
    >
      <Text variant="titleLg">{String(value)}</Text>
      <Text variant="caption" color="ink2">
        {caption}
      </Text>
    </View>
  );
}

/** Prototipo `ashare`, «Este mes se han unido»: cuántas personas por QR, enlace y código. */
export function JoinStatsSection({
  clientWord,
}: Readonly<{ clientWord: string }>): React.JSX.Element | null {
  const stats = useJoinStats();
  if (stats.data === undefined) return null;

  return (
    <View style={JOIN_STATS_ROW_STYLE.section}>
      <Text variant="titleMd">{i18n.t('centerAdmin.inviteClients.statsTitle')}</Text>
      <View style={JOIN_STATS_ROW_STYLE.row}>
        <JoinStat value={stats.data.qr} caption={i18n.t('centerAdmin.inviteClients.byQr')} />
        <JoinStat value={stats.data.link} caption={i18n.t('centerAdmin.inviteClients.byLink')} />
        <JoinStat value={stats.data.code} caption={i18n.t('centerAdmin.inviteClients.byCode')} />
      </View>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.inviteClients.statsTotal', {
          count: stats.data.total,
          clientWord,
        })}
      </Text>
    </View>
  );
}
