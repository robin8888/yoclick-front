import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

/** «★ 4,8 · 21 opiniones»; no dice nada mientras no haya opiniones publicadas. */
export function RatingSummaryLine({
  rating,
}: Readonly<{ rating: ProfileResponseDto['rating'] }>): React.JSX.Element | null {
  if (rating === null) return null;
  const average = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(
    rating.average,
  );

  return (
    <Text
      variant="caption"
      color="ink2"
      accessibilityLabel={i18n.t('teamProfiles.profile.ratingLabel', {
        average,
        count: rating.count,
      })}
    >
      {i18n.t('teamProfiles.profile.ratingSummary', { average, count: rating.count })}
    </Text>
  );
}
