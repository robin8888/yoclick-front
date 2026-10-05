import { i18n } from '@/shared/i18n';
import { SessionTimerDisplay } from '@/ui/organisms/SessionTimerDisplay';

import { useTickingNow } from '../hooks/useTickingNow';
import { computeSessionTimer, formatTimerDuration } from '../model/session-timer';

const SECONDS_PER_MINUTE = 60;

interface ClassTimerPanelProps {
  startedAt: string;
  plannedDurationMinutes: number;
}

/** El reloj de la clase en curso: cuenta atrás hasta la hora prevista y, si se pasa, tiempo extra. */
export function ClassTimerPanel({
  startedAt,
  plannedDurationMinutes,
}: Readonly<ClassTimerPanelProps>): React.JSX.Element {
  const now = useTickingNow();
  const plannedSeconds = plannedDurationMinutes * SECONDS_PER_MINUTE;
  const timer = computeSessionTimer({
    startedAt: new Date(startedAt),
    plannedDurationSeconds: plannedSeconds,
    now,
  });

  return (
    <SessionTimerDisplay
      mainTimeLabel={formatTimerDuration(
        timer.isOvertime ? timer.overtimeSeconds : timer.remainingSeconds,
      )}
      mainTimeCaption={i18n.t(
        timer.isOvertime
          ? 'staffAgenda.session.overtimeCaption'
          : 'staffAgenda.session.remainingCaption',
      )}
      detailLabel={i18n.t('staffAgenda.session.timerDetail', {
        elapsed: formatTimerDuration(timer.elapsedSeconds),
        planned: formatTimerDuration(plannedSeconds),
      })}
      progressFraction={timer.progressFraction}
      isOvertime={timer.isOvertime}
    />
  );
}
