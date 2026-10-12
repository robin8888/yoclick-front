import type { ScheduleSeriesWriteResponseDtoSkippedItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { summarizeSkippedOccurrences } from '../model/schedule-summary';

interface SkippedOccurrencesSheetProps {
  title: string;
  /** `null` mantiene la hoja cerrada. */
  skipped: readonly ScheduleSeriesWriteResponseDtoSkippedItem[] | null;
  onDone: () => void;
}

/** El horario se guardó, pero estas sesiones no se crearon (cierre, ausencia, choque o bloqueo). */
export function SkippedOccurrencesSheet({
  title,
  skipped,
  onDone,
}: Readonly<SkippedOccurrencesSheetProps>): React.JSX.Element {
  return (
    <BottomSheet isVisible={skipped !== null} title={title} onDismiss={onDone}>
      <Text color="ink2">{i18n.t('centerAdmin.schedules.skippedIntro')}</Text>
      {summarizeSkippedOccurrences(skipped ?? []).map((line) => (
        <Text key={line}>{line}</Text>
      ))}
      <Button isFullWidth label={i18n.t('centerAdmin.schedules.understood')} onPress={onDone} />
    </BottomSheet>
  );
}
