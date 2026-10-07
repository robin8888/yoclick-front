import { useState } from 'react';
import { View } from 'react-native';

import { useActiveCenterSectorId } from '@/features/join';
import type { PrivacyRequestListResponseDtoRequestsItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format/numeric-date';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useResolvePrivacyRequest } from '../hooks/usePrivacyRequests';
import { isRequestOverdue } from '../model/privacy-requests';
import { createConsentCardStyle } from '../screens/PrivacyLegalScreen.styles';

type RequestItem = PrivacyRequestListResponseDtoRequestsItem;

const ISO_DATE_LENGTH = 10;
const MAX_NOTE_LENGTH = 500;
const STACK_STYLE = { gap: 8 } as const;
const ROW_STYLE = { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' } as const;

function toNumericDate(isoInstant: string): string {
  return formatNumericDate(isoInstant.slice(0, ISO_DATE_LENGTH));
}

function AnswerActions({
  requestId,
  note,
}: Readonly<{ requestId: string; note: string }>): React.JSX.Element {
  const resolve = useResolvePrivacyRequest();

  return (
    <>
      {resolve.errorMessage === null ? null : <FormErrorBanner message={resolve.errorMessage} />}
      <View style={ROW_STYLE}>
        <Button
          size="sm"
          label={i18n.t('centerAdmin.privacy.requests.completeAction')}
          isLoading={resolve.isRunning}
          onPress={() => {
            resolve.run({ requestId, outcome: 'completed', ...(note !== '' && { note }) });
          }}
        />
        <Button
          size="sm"
          variant="outline"
          label={i18n.t('centerAdmin.privacy.requests.rejectAction')}
          isDisabled={note === '' || resolve.isRunning}
          onPress={() => {
            resolve.run({ requestId, outcome: 'rejected', note });
          }}
        />
      </View>
    </>
  );
}

function AnswerForm({ request }: Readonly<{ request: RequestItem }>): React.JSX.Element {
  const [note, setNote] = useState('');

  return (
    <View style={STACK_STYLE}>
      <Input
        value={note}
        onChangeText={setNote}
        accessibilityLabel={i18n.t('centerAdmin.privacy.requests.noteLabel')}
        placeholder={i18n.t('centerAdmin.privacy.requests.noteLabel')}
        maxLength={MAX_NOTE_LENGTH}
      />
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.privacy.requests.noteHint')}
      </Text>
      <AnswerActions requestId={request.id} note={note.trim()} />
    </View>
  );
}

function RequestDetails({ request }: Readonly<{ request: RequestItem }>): React.JSX.Element {
  const isAccessWaiting = request.kind === 'access' && request.status === 'open';

  return (
    <>
      <Text variant="caption" color="ink2">
        {request.resolvedAt === null
          ? i18n.t('centerAdmin.privacy.requests.dueOn', { date: toNumericDate(request.dueAt) })
          : i18n.t('centerAdmin.privacy.requests.resolvedOn', {
              date: toNumericDate(request.resolvedAt),
            })}
      </Text>
      {request.message === null ? null : (
        <Text color="ink2">
          {i18n.t('centerAdmin.privacy.requests.messageFromClient', { message: request.message })}
        </Text>
      )}
      {isAccessWaiting ? (
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.privacy.requests.exportHint')}
        </Text>
      ) : null}
    </>
  );
}

function RequestRow({ request }: Readonly<{ request: RequestItem }>): React.JSX.Element {
  const [isAnswering, setIsAnswering] = useState(false);
  const isOpen = request.status === 'open';

  return (
    <View style={STACK_STYLE}>
      <View style={ROW_STYLE}>
        <Text variant="bodyStrong">
          {i18n.t(`privacy.kinds.${request.kind}`)} · {request.clientName}
        </Text>
        {isRequestOverdue(request, new Date()) ? (
          <Badge label={i18n.t('centerAdmin.privacy.requests.overdue')} tone="danger" />
        ) : null}
      </View>
      <RequestDetails request={request} />
      {isOpen && !isAnswering ? (
        <Button
          size="sm"
          variant="secondary"
          label={i18n.t('centerAdmin.privacy.requests.respondAction')}
          accessibilityLabel={`${i18n.t('centerAdmin.privacy.requests.respondAction')}: ${request.clientName}`}
          onPress={() => {
            setIsAnswering(true);
          }}
        />
      ) : null}
      {isOpen && isAnswering ? <AnswerForm request={request} /> : null}
    </View>
  );
}

/** Las solicitudes de derechos de la clientela (RGPD): el centro responde en un mes como mucho. */
export function PrivacyRequestsAdminSection({
  requests,
}: Readonly<{ requests: readonly RequestItem[] }>): React.JSX.Element {
  const theme = useTheme();
  const { client } = getSectorVocabulary(useActiveCenterSectorId());

  return (
    <View style={STACK_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('centerAdmin.privacy.requests.title', { clientWord: client.plural })}
      </Text>
      {requests.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.privacy.requests.empty')}</Text>
      ) : (
        <View style={createConsentCardStyle(theme)}>
          {requests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </View>
      )}
    </View>
  );
}
