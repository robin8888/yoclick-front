import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { PlayableVideo } from '@/features/videos';
import type { ContentDetailResponseDto, VideoResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ImageContentCard } from '../components/ImageContentCard';
import { MediaDetails } from '../components/MediaDetails';
import { PdfDocumentCard } from '../components/PdfDocumentCard';
import { useMyContentDetail } from '../hooks/useContentQueries';
import { contentRouteParamsSchema } from '../model/content-routes';

/** Un vídeo asignado, ya procesado y aprobado, con la forma que espera el reproductor. */
function toPlayableVideo(content: ContentDetailResponseDto): VideoResponseDto {
  return {
    id: content.id,
    title: content.title,
    status: 'ready',
    reviewStatus: 'approved',
    reviewNote: null,
    durationSeconds: content.durationSeconds,
    playback: content.playback,
  };
}

function MediaViewer({
  content,
}: Readonly<{ content: ContentDetailResponseDto }>): React.JSX.Element {
  if (content.kind === 'video') return <PlayableVideo video={toPlayableVideo(content)} />;
  if (content.kind === 'image') return <ImageContentCard content={content} />;
  return <PdfDocumentCard content={content} />;
}

function MediaBody({
  content,
}: Readonly<{ content: ContentDetailResponseDto }>): React.JSX.Element {
  return (
    <>
      <MediaViewer content={content} />
      <MediaDetails content={content} isTitleHidden={content.kind === 'pdf'} />
    </>
  );
}

const MEDIA_TITLE_KEYS = {
  video: 'content.media.videoTitle',
  pdf: 'content.media.pdfTitle',
  image: 'content.media.imageTitle',
} as const;

function MediaContent({ contentId }: Readonly<{ contentId: string }>): React.JSX.Element {
  const router = useRouter();
  const detail = useMyContentDetail(contentId);
  const titleKey = MEDIA_TITLE_KEYS[detail.data?.kind ?? 'video'];

  return (
    <ScreenTemplate
      title={i18n.t(titleKey)}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {detail.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {detail.isError ? (
        <LoadErrorState
          title={i18n.t('content.media.errorTitle')}
          error={detail.error}
          onRetry={() => void detail.refetch()}
          isRetrying={detail.isFetching}
        />
      ) : null}
      {detail.isSuccess ? <MediaBody content={detail.data} /> : null}
    </ScreenTemplate>
  );
}

/** Prototipo `media`: ver un vídeo o leer un PDF de los que el centro ha asignado a la persona. */
export function MediaScreen(): React.JSX.Element {
  const params = contentRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/" />;
  return <MediaContent contentId={params.data.id} />;
}
