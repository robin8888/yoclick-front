import { useMyWaitlist, useWaitlistActions, buildWaitlistStatusLabel } from '@/features/waitlist';
import type { MyWaitlistResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { AppointmentCard, type AppointmentButtonAction } from '@/ui/organisms/AppointmentCard';

import type { BookingScope } from '../hooks/useMyBookings';
import { buildBookingDateTileLabels, DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';

type WaitlistActions = ReturnType<typeof useWaitlistActions>;

function buildActions(
  entry: MyWaitlistResponseDtoEntriesItem,
  actions: WaitlistActions,
): AppointmentButtonAction[] {
  const serviceName = entry.session.service.name;
  const leave: AppointmentButtonAction = {
    label:
      entry.status === 'offered'
        ? i18n.t('waitlist.declineAction')
        : i18n.t('waitlist.leaveAction'),
    accessibilityLabel: `${entry.status === 'offered' ? i18n.t('waitlist.declineAction') : i18n.t('waitlist.leaveAction')}: ${serviceName}`,
    variant: 'outline',
    onPress: () => {
      actions.leaveWaitlist(entry.id);
    },
  };
  if (entry.status !== 'offered') return [leave];
  const confirm: AppointmentButtonAction = {
    label: i18n.t('waitlist.confirmAction'),
    accessibilityLabel: `${i18n.t('waitlist.confirmAction')}: ${serviceName}`,
    variant: 'secondary',
    onPress: () => {
      actions.confirmOffer(entry.id);
    },
  };
  return [confirm, leave];
}

/** Las clases llenas en cuya espera está la persona, con su lugar o con la plaza ofrecida por confirmar. */
export function WaitlistBookingCards({
  scope,
}: Readonly<{ scope: BookingScope }>): React.JSX.Element | null {
  const entries = useMyWaitlist().data?.entries ?? [];
  const actions = useWaitlistActions();
  if (scope !== 'upcoming' || entries.length === 0) return null;

  return (
    <>
      <Text variant="titleMd">{i18n.t('waitlist.sectionTitle')}</Text>
      {actions.errorMessage === null ? null : <FormErrorBanner message={actions.errorMessage} />}
      {entries.map((entry) => (
        <AppointmentCard
          key={entry.id}
          dateTile={buildBookingDateTileLabels(entry.session.startsAt, DEFAULT_CENTER_TIME_ZONE)}
          serviceName={entry.session.service.name}
          detailsLabel={formatTime24h(entry.session.startsAt, DEFAULT_CENTER_TIME_ZONE)}
          statusLabel={buildWaitlistStatusLabel(entry, DEFAULT_CENTER_TIME_ZONE)}
          statusTone={entry.status === 'offered' ? 'warning' : 'info'}
          buttonActions={buildActions(entry, actions)}
        />
      ))}
    </>
  );
}
