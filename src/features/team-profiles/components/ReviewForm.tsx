import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useCreateStaffReview } from '../hooks/useTeamProfileMutations';
import { StarRatingInput } from './StarRating';
import { STACK_STYLE, WRAP_ROW_STYLE } from './TeamProfiles.styles';

const MAX_COMMENT_LENGTH = 500;
const DEFAULT_RATING = 5;

interface ReviewFormProps {
  membershipId: string;
  name: string;
  onClose: () => void;
}

function ReviewSent({
  message,
  onClose,
}: Readonly<{ message: string; onClose: () => void }>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      <Text>{message}</Text>
      <Button
        size="sm"
        variant="ghost"
        label={i18n.t('teamProfiles.review.cancelAction')}
        onPress={onClose}
      />
    </View>
  );
}

function ReviewFields({
  rating,
  onRatingChange,
  comment,
  onCommentChange,
}: Readonly<{
  rating: number;
  onRatingChange: (rating: number) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
}>): React.JSX.Element {
  return (
    <>
      <StarRatingInput rating={rating} onRatingChange={onRatingChange} />
      <Input
        value={comment}
        onChangeText={onCommentChange}
        accessibilityLabel={i18n.t('teamProfiles.review.commentLabel')}
        placeholder={i18n.t('teamProfiles.review.commentLabel')}
        maxLength={MAX_COMMENT_LENGTH}
      />
      <Text variant="caption" color="ink2">
        {i18n.t('teamProfiles.review.note')}
      </Text>
    </>
  );
}

function describeSentReview(status: string): string {
  return i18n.t(
    status === 'published'
      ? 'teamProfiles.review.sentPublished'
      : 'teamProfiles.review.sentPending',
  );
}

function ReviewActions({
  isRunning,
  onSend,
  onClose,
}: Readonly<{ isRunning: boolean; onSend: () => void; onClose: () => void }>): React.JSX.Element {
  return (
    <View style={WRAP_ROW_STYLE}>
      <Button
        size="sm"
        label={i18n.t('teamProfiles.review.sendAction')}
        isLoading={isRunning}
        onPress={onSend}
      />
      <Button
        size="sm"
        variant="ghost"
        label={i18n.t('teamProfiles.review.cancelAction')}
        onPress={onClose}
      />
    </View>
  );
}

/** Valorar a quien te dio una sesión: de 1 a 5 y un comentario opcional. Solo vale tras una sesión real. */
export function ReviewForm({
  membershipId,
  name,
  onClose,
}: Readonly<ReviewFormProps>): React.JSX.Element {
  const [rating, setRating] = useState(DEFAULT_RATING);
  const [comment, setComment] = useState('');
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const create = useCreateStaffReview(membershipId);

  if (sentMessage !== null) return <ReviewSent message={sentMessage} onClose={onClose} />;
  return (
    <View style={STACK_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('teamProfiles.review.title', { name })}
      </Text>
      <ReviewFields
        rating={rating}
        onRatingChange={setRating}
        comment={comment}
        onCommentChange={setComment}
      />
      {create.errorMessage === null ? null : <FormErrorBanner message={create.errorMessage} />}
      <ReviewActions
        isRunning={create.isRunning}
        onClose={onClose}
        onSend={() => {
          create.run({ rating, comment: comment.trim() }, (review) => {
            setSentMessage(describeSentReview(review.status));
          });
        }}
      />
    </View>
  );
}
