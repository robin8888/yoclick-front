import { View } from 'react-native';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { useCenterActivity } from '../hooks/useCenterActivity';
import { describeActivityAction, formatActivityMoment } from '../model/activity-text';
import { ACTIVITY_LIST_STYLE, createActivityRowStyle } from './ActivityLogSection.styles';

/** Prototipo `asec`, «Registro de actividad»: quién hizo qué en el centro, lo último primero. */
export function ActivityLogSection(): React.JSX.Element {
  const theme = useTheme();
  const activity = useCenterActivity();
  const entries = activity.data?.entries ?? [];
  const now = new Date();

  return (
    <View style={ACTIVITY_LIST_STYLE}>
      <Text variant="titleMd">{i18n.t('centerAdmin.security.activity.title')}</Text>
      {activity.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.security.activity.error')}
          error={activity.error}
          onRetry={() => void activity.refetch()}
          isRetrying={activity.isFetching}
        />
      ) : null}
      {activity.isSuccess && entries.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.security.activity.empty')}</Text>
      ) : null}
      {entries.map((entry) => (
        <View key={entry.id} style={createActivityRowStyle(theme)}>
          <Text>
            <Text variant="bodyStrong">
              {entry.actorName ?? i18n.t('centerAdmin.security.activity.system')}
            </Text>
            {` ${describeActivityAction(entry)}`}
          </Text>
          <Text variant="caption" color="ink2">
            {formatActivityMoment(entry.createdAt, now, DEFAULT_CENTER_TIME_ZONE)}
          </Text>
        </View>
      ))}
    </View>
  );
}
