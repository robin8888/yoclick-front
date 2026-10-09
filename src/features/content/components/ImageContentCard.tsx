import { Image } from 'expo-image';

import type { ContentDetailResponseDto } from '@/shared/api/generated/model';
import { useTheme } from '@/shared/theme';

import { createImageStyle } from './Content.styles';

/** La imagen asignada, a todo el ancho y con su proporción; el título va debajo, en los detalles. */
export function ImageContentCard({
  content,
}: Readonly<{ content: ContentDetailResponseDto }>): React.JSX.Element | null {
  const theme = useTheme();
  if (content.image === null) return null;

  return (
    <Image
      source={{ uri: content.image.url }}
      style={createImageStyle(theme)}
      contentFit="contain"
      accessibilityLabel={content.title}
    />
  );
}
