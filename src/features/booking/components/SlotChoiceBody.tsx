import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import type { ErrorType } from '@/shared/api/api-mutator';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import type { useBookSlotChoice } from '../hooks/useBookSlotChoice';
import { formatMonthAndYear } from '../model/booking-dates';
import { DayPillRow } from './DayPillRow';
import { SlotGrid } from './SlotGrid';

type SlotChoice = ReturnType<typeof useBookSlotChoice>;

interface SlotPickerProps {
  choice: SlotChoice;
  minNoticeLabel: string | null;
}

function SlotPicker({ choice, minNoticeLabel }: Readonly<SlotPickerProps>): React.JSX.Element {
  return (
    <>
      <Text variant="titleMd">{formatMonthAndYear(choice.selectedIsoDate ?? '')}</Text>
      <DayPillRow
        days={choice.days}
        selectedIsoDate={choice.selectedIsoDate}
        onDaySelect={choice.selectDay}
      />
      <Text variant="titleMd">{i18n.t('booking.slot.timesLabel')}</Text>
      <SlotGrid
        slots={choice.slotsOfSelectedDay}
        timeZone={choice.timeZone}
        selectedStartsAt={choice.selectedSlot?.startsAt ?? null}
        onSlotSelect={choice.selectSlot}
      />
      {minNoticeLabel === null ? null : (
        <Text variant="caption" color="ink2">
          {i18n.t('booking.slot.minNoticeHint', { notice: minNoticeLabel })}
        </Text>
      )}
    </>
  );
}

interface FailureProps {
  error: ErrorType;
  onRetry: () => void;
}

/** Los cuatro estados de la elección: cargando, error con reintento, sin horas y elegir. */
interface SlotChoiceBodyProps {
  choice: SlotChoice;
  /** «2 h»: antelación mínima del servicio; `null` mientras no se conoce. */
  minNoticeLabel: string | null;
}

export function SlotChoiceBody({
  choice,
  minNoticeLabel,
}: Readonly<SlotChoiceBodyProps>): React.JSX.Element {
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
  return <SlotPicker choice={choice} minNoticeLabel={minNoticeLabel} />;
}

function SlotLoadFailure({ error, onRetry }: Readonly<FailureProps>): React.JSX.Element {
  return (
    <LoadErrorState title={i18n.t('booking.slot.errorTitle')} error={error} onRetry={onRetry} />
  );
}
