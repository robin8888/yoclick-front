import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import type { ErrorType } from '@/shared/api/api-mutator';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import type { useBookSlotChoice } from '../hooks/useBookSlotChoice';
import { DayPillRow } from './DayPillRow';
import { SlotGrid } from './SlotGrid';

type SlotChoice = ReturnType<typeof useBookSlotChoice>;

function SlotPicker({ choice }: Readonly<{ choice: SlotChoice }>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong">{i18n.t('booking.slot.daysLabel')}</Text>
      <DayPillRow
        days={choice.days}
        selectedIsoDate={choice.selectedIsoDate}
        onDaySelect={choice.selectDay}
      />
      <Text variant="bodyStrong">{i18n.t('booking.slot.timesLabel')}</Text>
      <SlotGrid
        slots={choice.slotsOfSelectedDay}
        timeZone={choice.timeZone}
        selectedStartsAt={choice.selectedSlot?.startsAt ?? null}
        onSlotSelect={choice.selectSlot}
      />
    </>
  );
}

interface FailureProps {
  error: ErrorType;
  onRetry: () => void;
}

/** Los cuatro estados de la elección: cargando, error con reintento, sin horas y elegir. */
export function SlotChoiceBody({ choice }: Readonly<{ choice: SlotChoice }>): React.JSX.Element {
  const router = useRouter();

  if (choice.isLoading) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (choice.error !== null)
    return <SlotLoadFailure error={choice.error} onRetry={choice.refetch} />;
  if (!choice.hasAnySlot) {
    return (
      <EmptyState
        iconName="clock"
        title={i18n.t('booking.slot.noSlotsAtAll')}
        actionLabel={i18n.t('actions.back')}
        onActionPress={router.back}
      />
    );
  }
  return <SlotPicker choice={choice} />;
}

function SlotLoadFailure({ error, onRetry }: Readonly<FailureProps>): React.JSX.Element {
  return (
    <LoadErrorState title={i18n.t('booking.slot.errorTitle')} error={error} onRetry={onRetry} />
  );
}
