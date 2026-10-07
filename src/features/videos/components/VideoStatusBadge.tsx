import type { VideoResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Badge } from '@/ui/atoms/Badge';
import type { BadgeTone } from '@/ui/atoms/Badge/Badge.types';

type BadgeLabelKey =
  | 'videos.player.failedBadge'
  | 'videos.player.processingBadge'
  | 'videos.player.pendingReviewBadge'
  | 'videos.player.changesRequestedBadge';

interface BadgeContent {
  labelKey: BadgeLabelKey;
  tone: BadgeTone;
}

/** Primero lo que impide verlo (procesando, error) y luego lo que decide el centro. */
function resolveBadgeContent(video: VideoResponseDto): BadgeContent | null {
  if (video.status === 'failed') return { labelKey: 'videos.player.failedBadge', tone: 'danger' };
  if (video.status !== 'ready') return { labelKey: 'videos.player.processingBadge', tone: 'info' };
  if (video.reviewStatus === 'pending') {
    return { labelKey: 'videos.player.pendingReviewBadge', tone: 'warning' };
  }
  if (video.reviewStatus === 'changes_requested') {
    return { labelKey: 'videos.player.changesRequestedBadge', tone: 'warning' };
  }
  return null;
}

/** El estado de un vídeo con palabra, nunca solo con color. No muestra nada si ya está publicado. */
export function VideoStatusBadge({
  video,
  shouldShowApproved = false,
}: Readonly<{ video: VideoResponseDto; shouldShowApproved?: boolean }>): React.JSX.Element | null {
  const content = resolveBadgeContent(video);
  if (content === null) {
    return shouldShowApproved ? (
      <Badge label={i18n.t('videos.player.approvedBadge')} tone="success" />
    ) : null;
  }
  return <Badge label={i18n.t(content.labelKey)} tone={content.tone} />;
}
