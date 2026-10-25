import { Pressable, View } from 'react-native';

import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import type { PlatformCenterListResponseDtoDataItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { getCenterAttention } from '../model/center-attention';
import { getCapUsage } from '../model/client-cap-usage';
import {
  buildClientsLine,
  buildLastBookingLine,
  buildUsageLine,
  getAttentionLabel,
  getStatusLabel,
  getStatusTone,
} from '../model/center-labels';
import { getPlanName } from '../model/plan-labels';
import { BADGES_STYLE, IDENTITY_STYLE, PRESSED_STYLE } from './CenterRow.styles';
import { ClientCapMeter } from './ClientCapMeter';
import { Panel } from './Panel';
import { FLEXIBLE_TEXT_STYLE } from './Panel.styles';

interface CenterRowProps {
  center: PlatformCenterListResponseDtoDataItem;
  now: Date;
  onPress: () => void;
}

type Center = PlatformCenterListResponseDtoDataItem;

function CenterIdentity({ center }: Readonly<{ center: Center }>): React.JSX.Element {
  const sectorLabel = i18n.t(`onboarding.sectors.${center.sectorId as 'gym'}`);
  const details = [sectorLabel, center.city, getPlanName(center.planId)]
    .filter((part) => part !== null)
    .join(' · ');

  return (
    <View style={IDENTITY_STYLE}>
      <Avatar
        name={center.name}
        photoUrl={resolveApiAssetUrl(center.logoUrl)}
        size="md"
        isDecorative
      />
      <View style={FLEXIBLE_TEXT_STYLE}>
        <Text variant="bodyStrong">{center.name}</Text>
        <Text variant="caption" color="ink2">
          {details}
        </Text>
      </View>
    </View>
  );
}

function CenterBadges({ center, now }: Readonly<{ center: Center; now: Date }>): React.JSX.Element {
  const attention = getCenterAttention(center, now);

  return (
    <View style={BADGES_STYLE}>
      <Badge label={getStatusLabel(center.status)} tone={getStatusTone(center.status)} />
      {attention === null ? null : <Badge label={getAttentionLabel(attention)} tone="warning" />}
    </View>
  );
}

/** Un centro en la lista: nombre, estado, uso y, si merece mirarlo, por qué. Solo cifras. */
export function CenterRow({ center, now, onPress }: Readonly<CenterRowProps>): React.JSX.Element {
  const capUsage = getCapUsage(center.activeClientCount, center.maxClients);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={i18n.t('platform.centers.rowLabel', {
        name: center.name,
        status: getStatusLabel(center.status),
      })}
      onPress={onPress}
      style={({ pressed: isPressed }) => (isPressed ? PRESSED_STYLE : undefined)}
    >
      <Panel>
        <CenterIdentity center={center} />
        <CenterBadges center={center} now={now} />
        <Text variant="bodyStrong">{buildClientsLine(center)}</Text>
        {capUsage === null ? null : <ClientCapMeter usage={capUsage} />}
        <Text variant="caption" color="ink2">
          {buildUsageLine(center)}
        </Text>
        <Text variant="caption" color="ink2">
          {buildLastBookingLine(center.lastBookingAt)}
        </Text>
      </Panel>
    </Pressable>
  );
}
