import { i18n } from '@/shared/i18n';

import { formatTimerDuration } from './session-timer';

const MILLISECONDS_PER_SECOND = 1000;

interface InProgressLabelRequest {
  startedAt: string;
  now: Date;
}

/** «En curso · 12:34»: el tiempo desde que el servidor registró el inicio, nunca un contador local. */
export function buildInProgressLabel({ startedAt, now }: InProgressLabelRequest): string {
  const elapsedSeconds = (now.getTime() - new Date(startedAt).getTime()) / MILLISECONDS_PER_SECOND;
  return i18n.t('staffAgenda.agenda.inProgressElapsed', {
    elapsed: formatTimerDuration(elapsedSeconds),
  });
}

/** La clase está en marcha: se inició y todavía no se ha terminado. */
export function isSessionRunning(session: {
  startedAt: string | null;
  endedAt: string | null;
}): session is { startedAt: string; endedAt: null } {
  return session.startedAt !== null && session.endedAt === null;
}
