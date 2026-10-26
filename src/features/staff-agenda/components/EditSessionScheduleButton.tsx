import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

/** Abre el horario fijo de la clase para cambiar su hora, sala, profesor o plazas. */
export function EditSessionScheduleButton({
  seriesId,
}: Readonly<{ seriesId: string }>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      isFullWidth
      label={i18n.t('staffAgenda.rooms.editScheduleAction')}
      onPress={() => {
        router.push({ pathname: '/(admin)/schedules/edit/[seriesId]', params: { seriesId } });
      }}
    />
  );
}
