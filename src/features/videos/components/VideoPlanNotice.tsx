import { View } from 'react-native';

import type { VideoPlanResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatStorageSize } from '../model/video-format';
import { createCardStyle } from './Videos.styles';

/** Cuando el plan del centro no incluye vídeo: qué pasa y cómo conseguirlo (en la web, no en la app). */
export function VideoPlanNotice(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View accessible style={createCardStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('videos.plan.notIncludedTitle')}
      </Text>
      <Text color="ink2">{i18n.t('videos.plan.notIncludedDescription')}</Text>
    </View>
  );
}

/** Cuánto espacio de vídeo se ha usado del que tiene el plan. */
export function VideoPlanUsage({
  plan,
}: Readonly<{ plan: VideoPlanResponseDto }>): React.JSX.Element | null {
  if (plan.limitBytes === null) return null;
  return (
    <Text variant="caption" color="ink2">
      {i18n.t('videos.plan.usage', {
        used: formatStorageSize(plan.usedBytes),
        limit: formatStorageSize(plan.limitBytes),
      })}
    </Text>
  );
}
