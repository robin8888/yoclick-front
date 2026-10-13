import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import type { SessionPhase } from '../model/session-phase';

interface ClassSessionActionsProps {
  phase: SessionPhase;
  /** Dentro de la ventana de inicio (15 min antes hasta el fin de la cita). */
  canStartNow: boolean;
  /** Pasada la ventana la cita ya terminó sin registrarse: se explica y no se ofrece iniciarla. */
  isStartWindowPast: boolean;
  isStarting: boolean;
  onStart: () => void;
  onEndRequest: () => void;
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
  if (isStartWindowPast) {
    return <Text color="ink2">{i18n.t('staffAgenda.session.startTooLateHint')}</Text>;
  }
  return (
    <>
      <Button
        label={i18n.t('staffAgenda.session.startAction')}
        isFullWidth
        isDisabled={!canStartNow}
        isLoading={isStarting}
        onPress={onStart}
      />
      {canStartNow ? null : (
        <Text color="ink2">{i18n.t('staffAgenda.session.startTooEarlyHint')}</Text>
      )}
    </>
  );
}
