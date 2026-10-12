import type { EnrollResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { summarizeEnrollResult } from '../model/schedule-summary';

interface EnrollResultSheetProps {
  /** `null` mantiene la hoja cerrada. */
  result: EnrollResponseDto | null;
  namesByMembershipId: Readonly<Record<string, string>>;
  onDone: () => void;
}

/** Quién ha entrado en el grupo, quién no y por qué, y los días con otra cita. */
export function EnrollResultSheet({
  result,
  namesByMembershipId,
  onDone,
}: Readonly<EnrollResultSheetProps>): React.JSX.Element {
  const lines = result === null ? [] : summarizeEnrollResult({ result, namesByMembershipId });

  return (
    <BottomSheet
      isVisible={result !== null}
      title={i18n.t('centerAdmin.schedules.enrollResultTitle')}
      onDismiss={onDone}
    >
      {lines.map((line) => (
        <Text key={line}>{line}</Text>
      ))}
      <Button isFullWidth label={i18n.t('centerAdmin.schedules.understood')} onPress={onDone} />
    </BottomSheet>
  );
}
