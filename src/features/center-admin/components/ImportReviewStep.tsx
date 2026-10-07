import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import type { ImportSummary } from '../model/client-import-rows';
import { createImportColumnCardStyle } from './ImportColumnRow.styles';
import { SECTION_STACK_STYLE, SUMMARY_ROW_STYLE, SUMMARY_TILE_STYLE } from './ImportSteps.styles';

interface SummaryTileProps {
  count: number;
  label: string;
}

function SummaryTile({ count, label }: Readonly<SummaryTileProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${String(count)} ${label}`}
      style={[createImportColumnCardStyle(theme), SUMMARY_TILE_STYLE]}
    >
      <Text variant="titleMd">{count}</Text>
      <Text variant="caption" color="ink2">
        {label}
      </Text>
    </View>
  );
}

function SummaryTiles({ summary }: Readonly<{ summary: ImportSummary }>): React.JSX.Element {
  const { importableCount, withoutEmailCount, repeatedCount } = summary;

  return (
    <View style={SUMMARY_ROW_STYLE}>
      <SummaryTile
        count={importableCount}
        label={i18n.t('centerAdmin.importClients.review.importableLabel')}
      />
      <SummaryTile
        count={withoutEmailCount}
        label={i18n.t('centerAdmin.importClients.review.withoutEmailLabel')}
      />
      <SummaryTile
        count={repeatedCount}
        label={i18n.t('centerAdmin.importClients.review.repeatedLabel')}
      />
    </View>
  );
}

interface ImportReviewStepProps {
  summary: ImportSummary;
  clientWord: string;
  errorMessage: string | null;
  onImportPress: () => void;
}

/** Paso 3: lo que va a pasar con las filas, antes de enviar nada. */
export function ImportReviewStep({
  summary,
  clientWord,
  errorMessage,
  onImportPress,
}: Readonly<ImportReviewStepProps>): React.JSX.Element {
  const { importableCount, withoutEmailCount } = summary;

  return (
    <View style={SECTION_STACK_STYLE}>
      <SummaryTiles summary={summary} />
      {withoutEmailCount > 0 ? (
        <Text variant="caption" color="warning">
          {i18n.t('centerAdmin.importClients.review.withoutEmailNote', {
            count: withoutEmailCount,
          })}
        </Text>
      ) : null}
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.importClients.review.accountsNote', { clientWord })}
      </Text>
      {errorMessage ? <FormErrorBanner message={errorMessage} /> : null}
      <Button
        label={i18n.t('centerAdmin.importClients.review.importAction', { count: importableCount })}
        isFullWidth
        isDisabled={importableCount === 0}
        onPress={onImportPress}
      />
    </View>
  );
}
