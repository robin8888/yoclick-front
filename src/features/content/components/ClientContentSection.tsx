import { useState } from 'react';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';

import { useMyContent } from '../hooks/useContentQueries';
import { filterContent, NO_CONTENT_FILTER } from '../model/content-filter';
import { STACK_STYLE } from './Content.styles';
import { ContentFilterChips } from './ContentFilterChips';
import { ContentMediaGrid } from './ContentMediaGrid';
import { SectionTitleRow } from './SectionTitleRow';

/** «Vídeos y guías» del cliente: lo que su centro le ha asignado, filtrable por nivel y necesidad. */
export function ClientContentSection(): React.JSX.Element | null {
  const myContent = useMyContent();
  const [filter, setFilter] = useState(NO_CONTENT_FILTER);

  if (myContent.isPending) return null;
  if (myContent.isError) {
    return (
      <LoadErrorState
        title={i18n.t('content.client.errorTitle')}
        error={myContent.error}
        onRetry={() => void myContent.refetch()}
        isRetrying={myContent.isFetching}
      />
    );
  }
  const visibleContents = filterContent(myContent.data.items, filter);

  return (
    <View style={STACK_STYLE}>
      <SectionTitleRow
        title={i18n.t('content.client.title')}
        trailingText={i18n.t('content.client.resultCount', { count: visibleContents.length })}
      />
      {myContent.data.items.length === 0 ? (
        <EmptyState
          iconName="play"
          title={i18n.t('content.client.emptyTitle')}
          description={i18n.t('content.client.emptyDescription')}
          actionLabel={getSharedStateCopy().retryLabel}
          onActionPress={() => void myContent.refetch()}
        />
      ) : (
        <>
          <ContentFilterChips filter={filter} onFilterChange={setFilter} />
          <ContentMediaGrid contents={visibleContents} />
        </>
      )}
    </View>
  );
}
