import { Pressable, View } from 'react-native';

import type { PlatformCenterListResponseDtoDataItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { getCenterAttention } from '../model/center-attention';
import { getCapUsage } from '../model/client-cap-usage';
import { getPlanName } from '../model/plan-labels';
import {
  buildClientsLine,
  buildLastBookingLine,
  buildUsageLine,
  getAttentionLabel,
  getStatusLabel,
  getStatusTone,
} from '../model/center-labels';
import { ClientCapMeter } from './ClientCapMeter';
import {
  BADGES_STYLE,
  createCenterRowStyle,
  HEADER_STYLE,
  IDENTITY_STYLE,
  NAME_BLOCK_STYLE,
} from './CenterRow.styles';

interface CenterRowProps {
  center: PlatformCenterListResponseDtoDataItem;
  now: Date;
  onPress: () => void;
}

function CenterRowHeader({
  center,
  now,
}: Readonly<{ center: PlatformCenterListResponseDtoDataItem; now: Date }>): React.JSX.Element {
  const attention = getCenterAttention(center, now);
  const statusLabel = getStatusLabel(center.status);
  const sectorLabel = i18n.t(`onboarding.sectors.${center.sectorId as 'gym'}`);

  return (
    <View style={HEADER_STYLE}>
      <View style={IDENTITY_STYLE}>
        <Avatar name={center.name} size="md" isDecorative />
        <View style={NAME_BLOCK_STYLE}>
          <Text variant="bodyStrong">{center.name}</Text>
          <Text variant="caption" color="ink2">
            {[sectorLabel, center.city, getPlanName(center.planId)]
              .filter((part) => part !== null)
              .join(' · ')}
          </Text>
        </View>
      </View>
      <View style={BADGES_STYLE}>
        {attention === null ? null : <Badge label={getAttentionLabel(attention)} tone="warning" />}
        <Badge label={statusLabel} tone={getStatusTone(center.status)} />
      </View>
    </View>
  );
}

/** Un centro en la lista: nombre, estado, uso y, si merece mirarlo, por qué. Solo cifras. */
export function CenterRow({ center, now, onPress }: Readonly<CenterRowProps>): React.JSX.Element {
  const theme = useTheme();
  const statusLabel = getStatusLabel(center.status);
  const capUsage = getCapUsage(center.activeClientCount, center.maxClients);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={i18n.t('platform.centers.rowLabel', {
        name: center.name,
        status: statusLabel,
      })}
      onPress={onPress}
      style={createCenterRowStyle(theme)}
    >
      <CenterRowHeader center={center} now={now} />
      <Text variant="caption" color="ink2">
        {buildClientsLine(center)}
      </Text>
      {capUsage === null ? null : <ClientCapMeter usage={capUsage} />}
      <Text variant="caption" color="ink2">
        {buildUsageLine(center)}
      </Text>
      <Text variant="caption" color="ink2">
        {buildLastBookingLine(center.lastBookingAt)}
      </Text>
    </Pressable>
  );
}
