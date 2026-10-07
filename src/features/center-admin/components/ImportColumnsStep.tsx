import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import type { LoadedImportFile } from '../model/client-import-file';
import type { ImportField } from '../model/client-import-rows';
import { ImportColumnRow } from './ImportColumnRow';
import { SECTION_STACK_STYLE } from './ImportSteps.styles';

interface ImportColumnsStepProps {
  loadedFile: LoadedImportFile;
  canReview: boolean;
  onFieldSelect: (columnIndex: number, field: ImportField) => void;
  onReviewPress: () => void;
}

/** Paso 2: indicar qué es cada columna del archivo. */
export function ImportColumnsStep({
  loadedFile,
  canReview,
  onFieldSelect,
  onReviewPress,
}: Readonly<ImportColumnsStepProps>): React.JSX.Element {
  const [headerRow = [], firstDataRow = []] = loadedFile.tableRows;

  return (
    <View style={SECTION_STACK_STYLE}>
      <Text variant="body" color="ink2">
        {i18n.t('centerAdmin.importClients.columns.intro', {
          count: loadedFile.tableRows.length - 1,
          fileName: loadedFile.fileName,
        })}
      </Text>
      {headerRow.map((columnTitle, columnIndex) => (
        <ImportColumnRow
          // El orden de las columnas del archivo no cambia mientras se revisa.
          key={columnIndex}
          columnTitle={columnTitle === '' ? String(columnIndex + 1) : columnTitle}
          exampleValue={firstDataRow[columnIndex] ?? ''}
          selectedField={loadedFile.fieldByColumn[columnIndex] ?? 'skip'}
          onFieldSelect={(field) => {
            onFieldSelect(columnIndex, field);
          }}
        />
      ))}
      {canReview ? null : (
        <Text variant="caption" color="warning">
          {i18n.t('centerAdmin.importClients.columns.needsNameOrEmail')}
        </Text>
      )}
      <Button
        label={i18n.t('centerAdmin.importClients.columns.nextAction')}
        isFullWidth
        isDisabled={!canReview}
        onPress={onReviewPress}
      />
    </View>
  );
}
