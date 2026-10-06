import { View } from 'react-native';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import { LoadErrorState } from '@/features/join';
import type { OpenSessionsResponseDtoSessionsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { useCloseOpenSession, useOpenSessions } from '../hooks/useOpenSessions';
import { formatActivityMoment } from '../model/activity-text';
import {
  createSessionRowStyle,
  SECTION_STYLE,
  SESSION_TEXT_STYLE,
} from './OpenSessionsSection.styles';

interface SessionRowProps {
  session: OpenSessionsResponseDtoSessionsItem;
  isClosing: boolean;
  onClose: () => void;
}

function SessionRow({ session, isClosing, onClose }: Readonly<SessionRowProps>): React.JSX.Element {
  const theme = useTheme();
  const deviceName = session.deviceName ?? i18n.t('centerAdmin.security.unknownDevice');

  return (
    <View style={createSessionRowStyle(theme)}>
      <Icon name="lock" color="ink2" />
      <View style={SESSION_TEXT_STYLE}>
        <Text variant="bodyStrong">{deviceName}</Text>
        <Text variant="caption" color="ink2">
          {session.isCurrent
            ? i18n.t('centerAdmin.security.activeNow')
            : formatActivityMoment(session.lastActiveAt, new Date(), DEFAULT_CENTER_TIME_ZONE)}
        </Text>
      </View>
      {session.isCurrent ? (
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.security.thisSession')}
        </Text>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          label={i18n.t('centerAdmin.security.closeAction')}
          accessibilityHint={i18n.t('centerAdmin.security.closeHint', { device: deviceName })}
          isLoading={isClosing}
          onPress={onClose}
        />
      )}
    </View>
  );
}

/** Prototipo `asec`, «Sesiones abiertas»: los dispositivos con la sesión iniciada y cerrar los demás. */
export function OpenSessionsSection(): React.JSX.Element {
  const sessions = useOpenSessions();
  const { closeSession, closingSessionId, errorMessage } = useCloseOpenSession();

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd">{i18n.t('centerAdmin.security.sessionsTitle')}</Text>
      {sessions.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.security.sessionsError')}
          error={sessions.error}
          onRetry={() => void sessions.refetch()}
          isRetrying={sessions.isFetching}
        />
      ) : null}
      {sessions.data?.sessions.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          isClosing={closingSessionId === session.id}
          onClose={() => {
            closeSession(session.id);
          }}
        />
      ))}
      {errorMessage === null ? null : (
        <Text color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
