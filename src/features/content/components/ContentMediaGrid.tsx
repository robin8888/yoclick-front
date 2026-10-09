import { useRouter } from 'expo-router';
import { View } from 'react-native';

import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { useContentVocabulary } from '../hooks/useContentVocabulary';
import { buildContentMediaRoute } from '../model/content-routes';
import { GRID_STYLE, STACK_STYLE } from './Content.styles';
import { ContentMediaCard } from './ContentMediaCard';

/** La cuadrícula de dos columnas de «Vídeos y guías»; sin nada que enseñar, dice que se pruebe otro filtro. */
export function ContentMediaGrid({
  contents,
}: Readonly<{ contents: readonly ContentResponseDto[] }>): React.JSX.Element {
  const router = useRouter();
  const vocabulary = useContentVocabulary();

  if (contents.length === 0) {
    return (
      <View style={STACK_STYLE}>
        <Text variant="bodyStrong">{i18n.t('content.client.noResultsTitle')}</Text>
        <Text color="ink2">{i18n.t('content.client.noResultsDescription')}</Text>
      </View>
    );
  }
  return (
    <View style={GRID_STYLE}>
      {contents.map((content) => (
        <ContentMediaCard
          key={content.id}
          content={content}
          levelWords={vocabulary.levelWords}
          onPress={() => {
            router.push(buildContentMediaRoute(content.id));
          }}
        />
      ))}
    </View>
  );
}
