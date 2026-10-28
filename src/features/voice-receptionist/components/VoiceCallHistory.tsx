import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { VoiceCallsResponseDtoDataItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Skeleton } from '@/ui/atoms/Skeleton';
import { Text } from '@/ui/atoms/Text';

import { useVoiceCalls } from '../hooks/useVoiceCalls';
import { formatCallDuration, VOICE_OUTCOME_LABEL_KEYS } from '../model/voice-call-labels';
import {
  createVoiceCardStyle,
  createVoiceListStyle,
  createVoiceRowStyle,
} from './VoiceCard.styles';

function describeOutcome(call: VoiceCallsResponseDtoDataItem): string {
  return call.outcome === null
    ? i18n.t('voiceReceptionist.calls.noOutcome')
    : i18n.t(VOICE_OUTCOME_LABEL_KEYS[call.outcome]);
}

function VoiceCallRow({
  call,
}: Readonly<{ call: VoiceCallsResponseDtoDataItem }>): React.JSX.Element {
  const theme = useTheme();
  const caller = call.callerName ?? call.callerPhone;
  const outcome = describeOutcome(call);
  const duration = formatCallDuration(call.durationSeconds);
  const moment = `${formatShortDate(call.startedAt)} · ${formatTime24h(call.startedAt)}`;

  return (
    <View
      style={createVoiceListStyle(theme)}
      accessible
      accessibilityLabel={i18n.t('voiceReceptionist.calls.rowA11y', { caller, outcome })}
    >
      <View style={createVoiceRowStyle(theme)}>
        <Text variant="bodyStrong">{caller}</Text>
        <Badge label={outcome} tone={call.outcome === 'no_action' ? 'neutral' : 'brand'} />
      </View>
      <Text variant="caption" color="ink2">
        {duration === null ? moment : `${moment} · ${duration}`}
      </Text>
      {call.summary === null ? null : <Text color="ink2">{call.summary}</Text>}
    </View>
  );
}

function CallRows({
  calls,
}: Readonly<{ calls: readonly VoiceCallsResponseDtoDataItem[] }>): React.JSX.Element {
  const theme = useTheme();

  if (calls.length === 0) {
    return (
      <View style={createVoiceListStyle(theme)}>
        <Text variant="bodyStrong">{i18n.t('voiceReceptionist.calls.emptyTitle')}</Text>
        <Text color="ink2">{i18n.t('voiceReceptionist.calls.emptyDescription')}</Text>
      </View>
    );
  }
  return (
    <>
      {calls.map((call) => (
        <VoiceCallRow key={call.id} call={call} />
      ))}
    </>
  );
}

/** Las llamadas atendidas, la más reciente primero, con su resultado y «Ver más». */
export function VoiceCallHistory(): React.JSX.Element {
  const theme = useTheme();
  const { calls, query } = useVoiceCalls();

  return (
    <View style={createVoiceCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('voiceReceptionist.calls.title')}
      </Text>
      {query.isPending ? <Skeleton height={64} /> : null}
      {query.isError ? (
        <LoadErrorState
          title={i18n.t('voiceReceptionist.calls.errorTitle')}
          error={query.error}
          onRetry={() => {
            void query.refetch();
          }}
          isRetrying={query.isFetching}
        />
      ) : null}
      {query.isSuccess ? <CallRows calls={calls} /> : null}
      {query.hasNextPage ? (
        <Button
          variant="outline"
          label={i18n.t('voiceReceptionist.calls.moreAction')}
          isLoading={query.isFetchingNextPage}
          onPress={() => {
            void query.fetchNextPage();
          }}
        />
      ) : null}
    </View>
  );
}
