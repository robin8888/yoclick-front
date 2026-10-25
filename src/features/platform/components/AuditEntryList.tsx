import { Pressable, View } from 'react-native';

import type { PlatformAuditListResponseDtoDataItem } from '@/shared/api/generated/model';
import { formatShortDate, formatTime24h } from '@/shared/lib/format';
import { Text } from '@/ui/atoms/Text';

import { describeAuditEntry } from '../model/audit-description';
import { AUDIT_LIST_STYLE, AUDIT_PRESSED_STYLE } from './AuditEntryList.styles';
import { Panel } from './Panel';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';

interface AuditEntryListProps {
  entries: readonly PlatformAuditListResponseDtoDataItem[];
  /** Si se da, cada entrada de un centro se puede abrir. */
  onCenterOpen?: ((centerId: string) => void) | undefined;
}

/** Los cambios hechos desde la administración, lo último primero. */
export function AuditEntryList({
  entries,
  onCenterOpen,
}: Readonly<AuditEntryListProps>): React.JSX.Element {
  return (
    <View style={AUDIT_LIST_STYLE}>
      {entries.map((entry) => {
        const when = `${formatShortDate(entry.createdAt, PLATFORM_TIME_ZONE)} · ${formatTime24h(entry.createdAt, PLATFORM_TIME_ZONE)}`;
        const centerId = entry.centerId;
        const isOpenable = onCenterOpen !== undefined && centerId !== null;
        return (
          <Pressable
            key={entry.id}
            accessibilityRole={isOpenable ? 'button' : 'text'}
            accessibilityLabel={`${describeAuditEntry(entry)}. ${when}`}
            disabled={!isOpenable}
            onPress={() => {
              if (isOpenable) onCenterOpen(centerId);
            }}
            style={({ pressed: isPressed }) =>
              isPressed && isOpenable ? AUDIT_PRESSED_STYLE : undefined
            }
          >
            <Panel>
              <Text variant="bodyStrong">{describeAuditEntry(entry)}</Text>
              <Text variant="caption" color="ink2">
                {when}
              </Text>
            </Panel>
          </Pressable>
        );
      })}
    </View>
  );
}
