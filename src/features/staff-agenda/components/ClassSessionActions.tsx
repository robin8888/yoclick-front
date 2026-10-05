import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import type { SessionPhase } from '../model/session-phase';

interface ClassSessionActionsProps {
  phase: SessionPhase;
  /** Dentro de la ventana de inicio (15 min antes hasta el fin de la cita). */
  canStartNow: boolean;
  /** Antes de la ventana: se explica que aún es pronto; después, que ya terminó sin registrarse. */
  isStartWindowPast: boolean;
  isStarting: boolean;
  onStart: () => void;
  onEndRequest: () => void;
}

function describeBlockedStart(isStartWindowPast: boolean): string {
  return i18n.t(
    isStartWindowPast
      ? 'staffAgenda.session.startTooLateHint'
      : 'staffAgenda.session.startTooEarlyHint',
  );
}

/** El botón (o la explicación) que toca según el punto en el que está la clase. */
export function ClassSessionActions({
  phase,
  canStartNow,
  isStartWindowPast,
  isStarting,
  onStart,
  onEndRequest,
}: Readonly<ClassSessionActionsProps>): React.JSX.Element | null {
  if (phase === 'cancelled') {
    return <Text color="ink2">{i18n.t('staffAgenda.session.cancelledHint')}</Text>;
  }
  if (phase === 'in-progress') {
    return (
      <Button label={i18n.t('staffAgenda.session.endAction')} isFullWidth onPress={onEndRequest} />
    );
  }
  if (phase === 'finished') return null;
  return (
    <>
      <Button
        label={i18n.t('staffAgenda.session.startAction')}
        isFullWidth
        isDisabled={!canStartNow}
        isLoading={isStarting}
        onPress={onStart}
      />
      {canStartNow ? null : <Text color="ink2">{describeBlockedStart(isStartWindowPast)}</Text>}
    </>
  );
}
