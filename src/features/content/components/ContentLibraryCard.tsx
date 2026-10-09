import { Pressable, View } from 'react-native';

import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { createLibraryCardStyle, GROW_STYLE, ROW_STYLE } from './Content.styles';
import { ContentThumbnail } from './ContentThumbnail';

interface ContentLibraryCardProps {
  content: ContentResponseDto;
  /** Para quién es, ya escrito: «Nivel: Base», «Grupo: Mañanas», «Sin asignar». */
  caption: string;
  onAssignPress: () => void;
  /** Sin ella (el equipo no edita la biblioteca) la tarjeta solo informa. */
  onDetailsPress?: () => void;
}

interface CardSummaryProps {
  content: ContentResponseDto;
  caption: string;
  onDetailsPress: (() => void) | undefined;
}

/** La miniatura y el texto de la tarjeta; con `onDetailsPress` se puede tocar para ver los detalles. */
function CardSummary({
  content,
  caption,
  onDetailsPress,
}: Readonly<CardSummaryProps>): React.JSX.Element {
  const isTappable = onDetailsPress !== undefined;

  return (
    <Pressable
      accessibilityRole={isTappable ? 'button' : 'text'}
      accessibilityLabel={
        isTappable
          ? i18n.t('content.admin.openDetailsLabel', { title: content.title })
          : `${content.title}. ${caption}`
      }
      accessibilityHint={isTappable ? caption : undefined}
      disabled={!isTappable}
      onPress={onDetailsPress}
      style={[ROW_STYLE, GROW_STYLE]}
    >
      <ContentThumbnail kind={content.kind} thumbnailUrl={content.thumbnailUrl} />
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {content.title}
        </Text>
        {content.need === null ? null : <Badge tone="brand" label={content.need} />}
        <Text variant="caption" color="ink2" numberOfLines={2}>
          {content.isReady ? caption : i18n.t('content.admin.processingKind')}
        </Text>
      </View>
    </Pressable>
  );
}

/** Una pieza de la biblioteca: su miniatura, su título, a quién se enseña y el botón de asignar. */
export function ContentLibraryCard({
  content,
  caption,
  onAssignPress,
  onDetailsPress,
}: Readonly<ContentLibraryCardProps>): React.JSX.Element {
  const theme = useTheme();
  const isUnassigned = content.assignments.length === 0;

  return (
    <View style={createLibraryCardStyle(theme)}>
      <CardSummary content={content} caption={caption} onDetailsPress={onDetailsPress} />
      <Button
        size="sm"
        variant={isUnassigned ? 'primary' : 'secondary'}
        label={i18n.t('content.admin.assignAction')}
        accessibilityLabel={i18n.t('content.admin.assignActionLabel', { title: content.title })}
        onPress={onAssignPress}
      />
    </View>
  );
}
