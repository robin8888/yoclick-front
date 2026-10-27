import { useTickingNow } from '@/shared/hooks/useTickingNow';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { buildInProgressLabel } from '../model/in-progress-label';

interface InProgressClockProps {
  /** La hora de inicio que guarda el servidor (la haya pulsado alguien o se haya iniciado sola). */
  startedAt: string;
}

/** «En curso · 12:34»: el tiempo que lleva la clase o cita, que avanza cada segundo. */
export function InProgressBadge({ startedAt }: Readonly<InProgressClockProps>): React.JSX.Element {
  const now = useTickingNow();

  return <Badge label={buildInProgressLabel({ startedAt, now })} tone="brand" />;
}

/** El mismo contador como línea de texto, para los bloques de la agenda del día. */
export function InProgressText({ startedAt }: Readonly<InProgressClockProps>): React.JSX.Element {
  const now = useTickingNow();

  return (
    <Text variant="caption" color="brandInk" numberOfLines={1}>
      {buildInProgressLabel({ startedAt, now })}
    </Text>
  );
}
