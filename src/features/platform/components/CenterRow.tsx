import { Pressable, View } from 'react-native';

import type { PlatformCenterListResponseDtoDataItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { getCenterAttention } from '../model/center-attention';
import {
  buildClientsLine,
  buildLastBookingLine,
  buildUsageLine,
  getAttentionLabel,
  getStatusLabel,
  getStatusTone,
} from '../model/center-labels';
import { BADGES_STYLE, createCenterRowStyle, HEADER_STYLE } from './CenterRow.styles';

interface CenterRowProps {
  center: PlatformCenterListResponseDtoDataItem;
  now: Date;
  onPress: () => void;
}

/** Un centro en la lista: nombre, estado, uso y, si merece mirarlo, por qué. Solo cifras. */
export function CenterRow({ center, now, onPress }: Readonly<CenterRowProps>): React.JSX.Element {
  const theme = useTheme();
  const attention = getCenterAttention(center, now);
  const statusLabel = getStatusLabel(center.status);
  const sectorLabel = i18n.t(`onboarding.sectors.${center.sectorId as 'gym'}`);

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
      <View style={HEADER_STYLE}>
        <Text variant="bodyStrong">{center.name}</Text>
        <View style={BADGES_STYLE}>
          {attention === null ? null : (
            <Badge label={getAttentionLabel(attention)} tone="warning" />
          )}
          <Badge label={statusLabel} tone={getStatusTone(center.status)} />
        </View>
      </View>
      <Text variant="caption" color="ink2">
        {center.city === null ? sectorLabel : `${sectorLabel} · ${center.city}`}
      </Text>
      <Text variant="caption" color="ink2">
        {buildClientsLine(center)}
      </Text>
      <Text variant="caption" color="ink2">
        {buildUsageLine(center)}
      </Text>
      <Text variant="caption" color="ink2">
        {buildLastBookingLine(center.lastBookingAt)}
      </Text>
    </Pressable>
  );
}
