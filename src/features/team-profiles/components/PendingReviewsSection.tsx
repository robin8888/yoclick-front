import { View } from 'react-native';

import type { StaffReviewListResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useModerateStaffReview } from '../hooks/useTeamProfileMutations';
import { usePendingStaffReviews } from '../hooks/useTeamProfileQueries';
import { StarRating } from './StarRating';
import {
  createCardStyle,
  STACK_STYLE,
  TIGHT_STACK_STYLE,
  WRAP_ROW_STYLE,
} from './TeamProfiles.styles';

function ReviewDecisionButtons({
  author,
  isBusy,
  onDecision,
}: Readonly<{
  author: string;
  isBusy: boolean;
  onDecision: (isApproved: boolean) => void;
}>): React.JSX.Element {
  return (
    <View style={WRAP_ROW_STYLE}>
      <Button
        size="sm"
        label={i18n.t('teamProfiles.admin.publishReviewAction')}
        accessibilityLabel={i18n.t('teamProfiles.admin.publishReviewLabel', { author })}
        isDisabled={isBusy}
        onPress={() => {
          onDecision(true);
        }}
      />
      <Button
        size="sm"
        variant="outline"
        label={i18n.t('teamProfiles.admin.rejectReviewAction')}
        accessibilityLabel={i18n.t('teamProfiles.admin.rejectReviewLabel', { author })}
        isDisabled={isBusy}
        onPress={() => {
          onDecision(false);
        }}
      />
    </View>
  );
}

type PendingReview = StaffReviewListResponseDto['reviews'][number];

function PendingReviewCard({
  review,
  isBusy,
  onDecision,
}: Readonly<{
  review: PendingReview;
  isBusy: boolean;
  onDecision: (isApproved: boolean) => void;
}>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[createCardStyle(theme), TIGHT_STACK_STYLE]}>
      <Text variant="bodyStrong">
        {i18n.t('teamProfiles.admin.reviewAbout', {
          author: review.authorLabel,
          staff: review.staffName,
        })}
      </Text>
      <StarRating
        rating={review.rating}
        accessibilityLabel={i18n.t('teamProfiles.review.starLabel', { count: review.rating })}
      />
      {review.comment === null ? null : <Text>{review.comment}</Text>}
      <ReviewDecisionButtons author={review.authorLabel} isBusy={isBusy} onDecision={onDecision} />
    </View>
  );
}

/** Las opiniones que esperan al centro: se publican o se rechazan; quien las recibe lo sabe al publicarse. */
export function PendingReviewsSection(): React.JSX.Element | null {
  const pending = usePendingStaffReviews();
  const moderation = useModerateStaffReview();

  if (pending.data === undefined) return null;
  return (
    <View style={STACK_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('teamProfiles.admin.pendingReviewsTitle')}
      </Text>
      {pending.data.reviews.length === 0 ? (
        <Text color="ink2">{i18n.t('teamProfiles.admin.noPendingReviews')}</Text>
      ) : null}
      {pending.data.reviews.map((review) => (
        <PendingReviewCard
          key={review.id}
          review={review}
          isBusy={moderation.isRunning}
          onDecision={(isApproved) => {
            moderation.run({ reviewId: review.id, isApproved });
          }}
        />
      ))}
      {moderation.errorMessage === null ? null : (
        <FormErrorBanner message={moderation.errorMessage} />
      )}
    </View>
  );
}
