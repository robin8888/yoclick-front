import { View } from 'react-native';

import type {
  ImportClientsResponseDto,
  ImportClientsResponseDtoSkippedItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { CELEBRATION_STYLE, SECTION_STACK_STYLE, SKIPPED_ROW_STYLE } from './ImportSteps.styles';

interface SkippedRowProps {
  skippedRow: ImportClientsResponseDtoSkippedItem;
  clientWord: string;
}

function SkippedRow({ skippedRow, clientWord }: Readonly<SkippedRowProps>): React.JSX.Element {
  const { rowNumber, email, reason } = skippedRow;
  const reasonText = i18n.t(`centerAdmin.importClients.done.skipReason.${reason}`, { clientWord });

  return (
    <View accessible style={SKIPPED_ROW_STYLE}>
      <Text variant="bodyStrong">
        {i18n.t('centerAdmin.importClients.done.rowLabel', { rowNumber })}
      </Text>
      <Text variant="caption" color="ink2">
        {`${email ?? '—'} · ${reasonText}`}
      </Text>
    </View>
  );
}

interface SkippedRowsListProps {
  skippedRows: ImportClientsResponseDtoSkippedItem[];
  clientWord: string;
}

function SkippedRowsList({
  skippedRows,
  clientWord,
}: Readonly<SkippedRowsListProps>): React.JSX.Element | null {
  if (skippedRows.length === 0) return null;
  return (
    <View>
      <Text variant="bodyStrong" role="heading">
        {i18n.t('centerAdmin.importClients.done.skippedTitle', { count: skippedRows.length })}
      </Text>
      {skippedRows.map((skippedRow) => (
        <SkippedRow
          key={`${String(skippedRow.rowNumber)}-${skippedRow.reason}`}
          skippedRow={skippedRow}
          clientWord={clientWord}
        />
      ))}
    </View>
  );
}

interface ImportDoneStepProps {
  report: ImportClientsResponseDto;
  clientWord: string;
  onSeeClientsPress: () => void;
  onImportAnotherPress: () => void;
}

/** Paso final: cuántas personas entraron y qué filas se quedaron fuera y por qué. */
export function ImportDoneStep({
  report,
  clientWord,
  onSeeClientsPress,
  onImportAnotherPress,
}: Readonly<ImportDoneStepProps>): React.JSX.Element {
  const { createdCount, updatedCount, skipped } = report;

  return (
    <View style={SECTION_STACK_STYLE}>
      <View accessible style={CELEBRATION_STYLE}>
        <Icon name="checkCircle" size="large" color="success" />
        <Text variant="titleMd" align="center">
          {i18n.t('centerAdmin.importClients.done.title')}
        </Text>
        <Text variant="body" color="ink2" align="center">
          {i18n.t('centerAdmin.importClients.done.summary', { createdCount, updatedCount })}
        </Text>
      </View>
      <SkippedRowsList skippedRows={skipped} clientWord={clientWord} />
      <Button
        label={i18n.t('centerAdmin.importClients.done.seeClientsAction', { clientWord })}
        isFullWidth
        onPress={onSeeClientsPress}
      />
      <Button
        label={i18n.t('centerAdmin.importClients.done.importAnotherAction')}
        variant="ghost"
        isFullWidth
        onPress={onImportAnotherPress}
      />
    </View>
  );
}
