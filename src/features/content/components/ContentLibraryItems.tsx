import { View } from 'react-native';

import { formatStorageSize } from '@/features/videos';
import type { ContentLibraryResponseDto, ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { useContentVocabulary } from '../hooks/useContentVocabulary';
import { describeAssignments } from '../model/content-captions';
import { STACK_STYLE } from './Content.styles';
import { ContentLibraryCard } from './ContentLibraryCard';
import { SectionTitleRow } from './SectionTitleRow';

interface ContentLibraryItemsProps {
  library: ContentLibraryResponseDto;
  onAssignPress: (content: ContentResponseDto) => void;
  onDetailsPress?: ((content: ContentResponseDto) => void) | undefined;
}

/** Las piezas de la biblioteca, cada una con a quién se enseña, y el espacio de PDF gastado. */
export function ContentLibraryItems({
  library,
  onAssignPress,
  onDetailsPress,
}: Readonly<ContentLibraryItemsProps>): React.JSX.Element {
  const vocabulary = useContentVocabulary();
  const captionWords = {
    levelWords: vocabulary.levelWords,
    clientWord: vocabulary.capitalizedClientWord,
  };

  return (
    <View style={STACK_STYLE}>
      <SectionTitleRow
        title={i18n.t('content.admin.libraryTitle')}
        trailingText={i18n.t('content.admin.itemCount', { count: library.items.length })}
      />
      {library.items.map((content) => (
        <ContentLibraryCard
          key={content.id}
          content={content}
          caption={describeAssignments(content.assignments, captionWords)}
          onAssignPress={() => {
            onAssignPress(content);
          }}
          {...(onDetailsPress !== undefined && {
            onDetailsPress: () => {
              onDetailsPress(content);
            },
          })}
        />
      ))}
      <Text variant="caption" color="ink2">
        {i18n.t('content.admin.storageUsage', {
          used: formatStorageSize(library.storage.usedBytes),
          limit: formatStorageSize(library.storage.limitBytes),
        })}
      </Text>
    </View>
  );
}
