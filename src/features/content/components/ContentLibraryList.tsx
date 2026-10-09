import { LoadErrorState } from '@/features/join';
import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { useContentLibrary } from '../hooks/useContentQueries';
import { useContentVocabulary } from '../hooks/useContentVocabulary';
import { ContentLibraryItems } from './ContentLibraryItems';

interface ContentLibraryListProps {
  /** Quien administra sube y edita; el equipo solo asigna lo que ya hay. */
  canManageLibrary: boolean;
  onUploadRequest: () => void;
  onAssignPress: (content: ContentResponseDto) => void;
  onDetailsPress: (content: ContentResponseDto) => void;
}

interface LibraryEmptyStateProps {
  canManageLibrary: boolean;
  onUploadRequest: () => void;
  onRetry: () => void;
}

/** Biblioteca vacía: quien administra la llena; el equipo espera a que lo haga y puede reintentar. */
function LibraryEmptyState({
  canManageLibrary,
  onUploadRequest,
  onRetry,
}: Readonly<LibraryEmptyStateProps>): React.JSX.Element {
  const vocabulary = useContentVocabulary();

  return (
    <EmptyState
      iconName="file"
      title={i18n.t('content.admin.emptyTitle')}
      description={
        canManageLibrary
          ? i18n.t('content.admin.emptyDescription', { client: vocabulary.clientWord })
          : i18n.t('content.admin.teamEmptyDescription')
      }
      actionLabel={
        canManageLibrary ? i18n.t('content.admin.uploadTitle') : getSharedStateCopy().retryLabel
      }
      onActionPress={canManageLibrary ? onUploadRequest : onRetry}
    />
  );
}

/** «Biblioteca» con sus estados: cargando, error con reintento, vacía con su acción, o las piezas. */
export function ContentLibraryList({
  canManageLibrary,
  onUploadRequest,
  onAssignPress,
  onDetailsPress,
}: Readonly<ContentLibraryListProps>): React.JSX.Element {
  const library = useContentLibrary();

  if (library.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (library.isError) {
    return (
      <LoadErrorState
        title={i18n.t('content.admin.errorTitle')}
        error={library.error}
        onRetry={() => void library.refetch()}
        isRetrying={library.isFetching}
      />
    );
  }
  if (library.data.items.length === 0) {
    return (
      <LibraryEmptyState
        canManageLibrary={canManageLibrary}
        onUploadRequest={onUploadRequest}
        onRetry={() => void library.refetch()}
      />
    );
  }
  return (
    <ContentLibraryItems
      library={library.data}
      onAssignPress={onAssignPress}
      {...(canManageLibrary && { onDetailsPress })}
    />
  );
}
