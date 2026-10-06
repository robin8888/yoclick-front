import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  formatContrastRatio,
  type BrandContrastReport,
  type ContrastLevel,
  type ContrastRow,
  type ContrastRowId,
} from '../model/brand-contrast-report';
import {
  CONTRAST_HEADER_STYLE,
  CONTRAST_RESULT_STYLE,
  CONTRAST_ROW_STYLE,
  createContrastCardStyle,
} from './ContrastReportCard.styles';

interface ContrastReportCardProps {
  report: BrandContrastReport;
}

const LEVEL_TEXT_KEYS = {
  aa: 'branding.contrast.levelAa',
  'large-text-only': 'branding.contrast.levelLarge',
  fail: 'branding.contrast.levelFail',
} as const satisfies Record<ContrastLevel, string>;

const ROW_TEXT_KEYS = {
  'on-button': 'branding.contrast.rows.on-button',
  'ink-light': 'branding.contrast.rows.ink-light',
  'ink-dark': 'branding.contrast.rows.ink-dark',
} as const satisfies Record<ContrastRowId, string>;

function ContrastRowView({ row }: Readonly<{ row: ContrastRow }>): React.JSX.Element {
  const isPassing = row.level === 'aa';
  const resultColor = isPassing ? 'success' : 'warning';

  return (
    <View style={CONTRAST_ROW_STYLE}>
      <Text>{i18n.t(ROW_TEXT_KEYS[row.id])}</Text>
      <View style={CONTRAST_RESULT_STYLE}>
        <Icon name={isPassing ? 'check' : 'alertTriangle'} size="inline" color={resultColor} />
        <Text variant="bodyStrong" color={resultColor}>
          {`${formatContrastRatio(row.ratio)} ${i18n.t(LEVEL_TEXT_KEYS[row.level])}`}
        </Text>
      </View>
    </View>
  );
}

/** Prototipo `abrand`, «Contraste accesible»: qué contraste tendrán el texto y los botones. */
export function ContrastReportCard({
  report,
}: Readonly<ContrastReportCardProps>): React.JSX.Element {
  const theme = useTheme();
  const isEverythingPassing = report.rows.every((row) => row.level === 'aa');

  return (
    <View style={createContrastCardStyle(theme)}>
      <View style={CONTRAST_HEADER_STYLE}>
        <Text variant="titleMd" role="heading">
          {i18n.t('branding.contrast.title')}
        </Text>
        <Badge
          label={i18n.t(
            isEverythingPassing ? 'branding.contrast.badgePass' : 'branding.contrast.badgeReview',
          )}
          tone={isEverythingPassing ? 'success' : 'warning'}
        />
      </View>
      {report.rows.map((row) => (
        <ContrastRowView key={row.id} row={row} />
      ))}
      {report.wasInkAdjusted ? (
        <Text variant="caption" color="ink2">
          {i18n.t('branding.contrast.adjustedNote')}
        </Text>
      ) : null}
    </View>
  );
}
