import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { useStaffReviewList } from '../hooks/useTeamProfileQueries';
import { StarRating } from './StarRating';
import { createCardStyle, STACK_STYLE, TIGHT_STACK_STYLE } from './TeamProfiles.styles';

/** Las opiniones publicadas sobre una persona del equipo; solo cuentan las de sesiones reales. */
export function ReviewsList({
  membershipId,
}: Readonly<{ membershipId: string }>): React.JSX.Element {
  const theme = useTheme();
  const reviews = useStaffReviewList(membershipId);
  const list = reviews.data?.reviews ?? [];

  return (
    <View style={STACK_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('teamProfiles.profile.reviewsTitle')}
      </Text>
      {reviews.isSuccess && list.length === 0 ? (
        <Text color="ink2">{i18n.t('teamProfiles.profile.noReviews')}</Text>
      ) : null}
      {list.map((review) => (
        <View key={review.id} style={[createCardStyle(theme), TIGHT_STACK_STYLE]}>
          <StarRating
            rating={review.rating}
            accessibilityLabel={i18n.t('teamProfiles.review.starLabel', { count: review.rating })}
          />
          {review.comment === null ? null : <Text>{review.comment}</Text>}
          <Text variant="caption" color="ink2">
            {i18n.t('teamProfiles.profile.reviewMeta', { author: review.authorLabel })}
          </Text>
        </View>
      ))}
    </View>
  );
}
