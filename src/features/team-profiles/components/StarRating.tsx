import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createStarButtonStyle, ROW_STYLE } from './TeamProfiles.styles';

const STAR_COUNT = 5;
const STARS = Array.from({ length: STAR_COUNT }, (_unused, index) => index + 1);

/** Las estrellas de una opinión, solo para mirar: la puntuación va también en la etiqueta accesible. */
export function StarRating({
  rating,
  accessibilityLabel,
}: Readonly<{ rating: number; accessibilityLabel: string }>): React.JSX.Element {
  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={ROW_STYLE}>
      {STARS.map((star) => (
        <Text key={star} color={star <= Math.round(rating) ? 'brandInk' : 'ink2'}>
          {star <= Math.round(rating) ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}

/** Elegir de 1 a 5 estrellas: un grupo de botones de opción, cada uno con su número dicho en voz alta. */
export function StarRatingInput({
  rating,
  onRatingChange,
}: Readonly<{ rating: number; onRatingChange: (rating: number) => void }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={i18n.t('teamProfiles.review.ratingGroupLabel')}
      style={ROW_STYLE}
    >
      {STARS.map((star) => (
        <Pressable
          key={star}
          accessibilityRole="radio"
          accessibilityLabel={i18n.t('teamProfiles.review.starLabel', { count: star })}
          accessibilityState={{ checked: star === rating }}
          onPress={() => {
            onRatingChange(star);
          }}
          style={createStarButtonStyle(theme)}
        >
          <Text variant="titleLg" color={star <= rating ? 'brandInk' : 'ink2'}>
            {star <= rating ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
