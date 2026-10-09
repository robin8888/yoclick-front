import { View } from 'react-native';

import { formatStorageSize } from '@/features/videos';
import type { ContentDetailResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useActiveCenterName } from '../hooks/useActiveCenterName';
import { useContentVocabulary } from '../hooks/useContentVocabulary';
import { useOpenPdf } from '../hooks/useOpenPdf';
import {
  CENTERED_ROW_STYLE,
  createDocumentIconStyle,
  createDocumentSheetStyle,
  STACK_STYLE,
} from './Content.styles';

/** Lo que es y cuánto ocupa: «PDF», sus páginas (si se pudieron contar) y su tamaño. */
function PdfFacts({ content }: Readonly<{ content: ContentDetailResponseDto }>): React.JSX.Element {
  return (
    <View style={CENTERED_ROW_STYLE}>
      <Badge tone="brand" label={i18n.t('content.kind.pdf')} />
      {content.pageCount === null ? null : (
        <Badge label={i18n.t('content.meta.pages', { count: content.pageCount })} />
      )}
      <Badge label={formatStorageSize(content.sizeBytes)} />
    </View>
  );
}

/** El PDF como una hoja: su icono, su nombre, de quién es y cuánto ocupa; y debajo el botón que lo abre. */
export function PdfDocumentCard({
  content,
}: Readonly<{ content: ContentDetailResponseDto }>): React.JSX.Element {
  const theme = useTheme();
  const { contentTabLabel } = useContentVocabulary();
  const pdf = useOpenPdf(content.document?.url ?? null);
  const caption = i18n.t('content.media.pdfCardCaption', {
    center: useActiveCenterName(),
    tab: contentTabLabel.toLowerCase(),
  });

  return (
    <View style={STACK_STYLE}>
      <View style={createDocumentSheetStyle(theme)}>
        <View style={createDocumentIconStyle(theme)}>
          <Icon name="file" size="large" color="brandInk" />
        </View>
        <Text variant="titleMd" align="center">
          {content.title}
        </Text>
        <Text variant="caption" color="ink2" align="center">
          {caption}
        </Text>
        <PdfFacts content={content} />
      </View>
      {pdf.hasFailed ? <FormErrorBanner message={i18n.t('content.media.openFailed')} /> : null}
      <Button
        leadingIconName="file"
        label={i18n.t('content.media.downloadAction')}
        isFullWidth
        isDisabled={content.document === null}
        onPress={pdf.open}
      />
    </View>
  );
}
