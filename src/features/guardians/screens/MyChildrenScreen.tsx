import { View } from 'react-native';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import { LoadErrorState } from '@/features/join';
import type { MyChildrenResponseDto } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useMyChildren } from '../hooks/useMyChildren';
import { createChildCardStyle, CHILD_HEADER_STYLE, GROW_STYLE } from './MyChildrenScreen.styles';

type Child = MyChildrenResponseDto['children'][number];

function ChildCard({ child }: Readonly<{ child: Child }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createChildCardStyle(theme)}>
      <View style={CHILD_HEADER_STYLE}>
        <Avatar name={child.fullName} photoUrl={child.photoUrl} size="lg" isDecorative />
        <View style={GROW_STYLE}>
          <Text variant="titleMd">{child.fullName}</Text>
          <Badge
            label={i18n.t('guardians.remainingSessions', { count: child.remainingSessions })}
            tone={child.remainingSessions > 0 ? 'brand' : 'info'}
          />
        </View>
      </View>
      <Text variant="bodyStrong">{i18n.t('guardians.upcomingTitle')}</Text>
      {child.upcomingBookings.length === 0 ? (
        <Text color="ink2">{i18n.t('guardians.noUpcoming')}</Text>
      ) : null}
      {child.upcomingBookings.map((booking) => (
        <Text key={booking.id} color="ink2">
          {`${booking.serviceName} · ${formatShortDate(booking.startsAt, DEFAULT_CENTER_TIME_ZONE)} ${formatTime24h(booking.startsAt, DEFAULT_CENTER_TIME_ZONE)} · ${booking.teacherName}`}
        </Text>
      ))}
    </View>
  );
}

/** «Mis hijos»: las personas a cargo del tutor, con sus próximas clases y lo que les queda en el bono. */
export function MyChildrenScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const children = useMyChildren();

  return (
    <ScreenTemplate
      title={i18n.t('guardians.title')}
      subtitle={i18n.t('guardians.subtitle')}
      onBackPress={onBackPress}
    >
      {children.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {children.isError ? (
        <LoadErrorState
          title={i18n.t('guardians.loadError')}
          error={children.error}
          onRetry={() => {
            void children.refetch();
          }}
        />
      ) : null}
      {children.data?.children.length === 0 ? (
        <EmptyState
          iconName="users"
          title={i18n.t('guardians.emptyTitle')}
          description={i18n.t('guardians.emptyDescription')}
          actionLabel={getSharedStateCopy().retryLabel}
          onActionPress={() => {
            void children.refetch();
          }}
        />
      ) : null}
      {children.data?.children.map((child) => (
        <ChildCard key={child.membershipId} child={child} />
      ))}
    </ScreenTemplate>
  );
}
