import { useState } from 'react';
import { View } from 'react-native';

import type { PrivacyRequestListResponseDtoRequestsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useCreatePrivacyRequest } from '../hooks/usePrivacyMutations';
import {
  formatRequestDate,
  PRIVACY_RIGHT_KINDS,
  type PrivacyRightKind,
} from '../model/privacy-rights';
import {
  createCardStyle,
  GROW_STYLE,
  ROW_STYLE,
  SECTION_STYLE,
  WRAP_ROW_STYLE,
} from './Privacy.styles';

const MAX_MESSAGE_LENGTH = 500;

type RequestItem = PrivacyRequestListResponseDtoRequestsItem;

function RequestForm({
  kind,
  onClose,
}: Readonly<{ kind: PrivacyRightKind; onClose: () => void }>): React.JSX.Element {
  const [message, setMessage] = useState('');
  const create = useCreatePrivacyRequest();

  return (
    <View style={SECTION_STYLE}>
      <Input
        value={message}
        onChangeText={setMessage}
        accessibilityLabel={i18n.t('privacy.requests.messageLabel')}
        placeholder={i18n.t('privacy.requests.messageLabel')}
        maxLength={MAX_MESSAGE_LENGTH}
      />
      {create.errorMessage === null ? null : <FormErrorBanner message={create.errorMessage} />}
      <View style={WRAP_ROW_STYLE}>
        <Button
          size="sm"
          label={i18n.t('privacy.requests.sendAction')}
          isLoading={create.isRunning}
          onPress={() => {
            create.run({ kind, message: message.trim() }, onClose);
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          label={i18n.t('privacy.requests.cancelAction')}
          onPress={onClose}
        />
      </View>
    </View>
  );
}

function RightRow({
  kind,
  isOpen,
  isAlreadyAsked,
  onAsk,
  onClose,
}: Readonly<{
  kind: PrivacyRightKind;
  isOpen: boolean;
  isAlreadyAsked: boolean;
  onAsk: () => void;
  onClose: () => void;
}>): React.JSX.Element {
  const label = i18n.t(`privacy.kinds.${kind}`);

  return (
    <View style={SECTION_STYLE}>
      <View style={ROW_STYLE}>
        <View style={GROW_STYLE}>
          <Text variant="bodyStrong">{label}</Text>
          <Text variant="caption" color="ink2">
            {i18n.t(`privacy.kindHints.${kind}`)}
          </Text>
        </View>
        <Button
          size="sm"
          variant="outline"
          label={i18n.t('privacy.requests.askAction')}
          accessibilityLabel={i18n.t('privacy.requests.askLabel', { right: label })}
          isDisabled={isAlreadyAsked || isOpen}
          onPress={onAsk}
        />
      </View>
      {isOpen ? <RequestForm kind={kind} onClose={onClose} /> : null}
    </View>
  );
}

const STATUS_BADGES = {
  open: { labelKey: 'privacy.requests.statusOpen', tone: 'info' },
  completed: { labelKey: 'privacy.requests.statusCompleted', tone: 'success' },
  rejected: { labelKey: 'privacy.requests.statusRejected', tone: 'danger' },
} as const;

function MyRequestRow({ request }: Readonly<{ request: RequestItem }>): React.JSX.Element {
  const badge = STATUS_BADGES[request.status];

  return (
    <View accessible style={SECTION_STYLE}>
      <View style={ROW_STYLE}>
        <Text variant="bodyStrong">{i18n.t(`privacy.kinds.${request.kind}`)}</Text>
        <Badge label={i18n.t(badge.labelKey)} tone={badge.tone} />
      </View>
      <Text variant="caption" color="ink2">
        {request.resolvedAt === null
          ? i18n.t('privacy.requests.dueOn', { date: formatRequestDate(request.dueAt) })
          : i18n.t('privacy.requests.resolvedOn', { date: formatRequestDate(request.resolvedAt) })}
      </Text>
      {request.resolutionNote === null ? null : (
        <Text color="ink2">
          {i18n.t('privacy.requests.resolutionNote', { note: request.resolutionNote })}
        </Text>
      )}
    </View>
  );
}

function MyRequestsList({
  requests,
}: Readonly<{ requests: readonly RequestItem[] }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('privacy.requests.mineTitle')}
      </Text>
      {requests.length === 0 ? (
        <Text color="ink2">{i18n.t('privacy.requests.emptyMine')}</Text>
      ) : (
        <View style={createCardStyle(theme)}>
          {requests.map((request) => (
            <MyRequestRow key={request.id} request={request} />
          ))}
        </View>
      )}
    </View>
  );
}

/** Los cuatro derechos que se piden al centro, y lo que la persona ya ha pedido. */
export function PrivacyRequestsSection({
  requests,
}: Readonly<{ requests: readonly RequestItem[] }>): React.JSX.Element {
  const theme = useTheme();
  const [openKind, setOpenKind] = useState<PrivacyRightKind | null>(null);
  const openKinds = new Set(
    requests.filter(({ status }) => status === 'open').map(({ kind }) => kind),
  );

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('privacy.requests.title')}
      </Text>
      <Text color="ink2">{i18n.t('privacy.requests.intro')}</Text>
      <View style={createCardStyle(theme)}>
        {PRIVACY_RIGHT_KINDS.map((kind) => (
          <RightRow
            key={kind}
            kind={kind}
            isOpen={openKind === kind}
            isAlreadyAsked={openKinds.has(kind)}
            onAsk={() => {
              setOpenKind(kind);
            }}
            onClose={() => {
              setOpenKind(null);
            }}
          />
        ))}
      </View>
      <MyRequestsList requests={requests} />
    </View>
  );
}
