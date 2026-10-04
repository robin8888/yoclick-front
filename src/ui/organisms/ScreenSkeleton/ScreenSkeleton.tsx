import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Skeleton } from '@/ui/atoms/Skeleton';

import {
  AVATAR_PLACEHOLDER_SIZE,
  createRowStyle,
  createRowTextStyle,
  createScreenSkeletonStyle,
  SKELETON_DELAY_MS,
} from './ScreenSkeleton.styles';
import type { ScreenSkeletonProps } from './ScreenSkeleton.types';

const DEFAULT_ROW_COUNT = 4;

/**
 * Esqueleto de pantalla. Se monta mientras la pantalla carga y no pinta nada durante los primeros
 * 300 ms: una carga rápida no debe parpadear con un esqueleto (docs/design `stload`).
 */
export function ScreenSkeleton({
  loadingLabel,
  rowCount = DEFAULT_ROW_COUNT,
  delayMs = SKELETON_DELAY_MS,
}: Readonly<ScreenSkeletonProps>): React.JSX.Element | null {
  const theme = useTheme();
  const [hasDelayElapsed, setHasDelayElapsed] = useState(false);

  // Sincroniza con un temporizador (sistema externo): es lo que justifica el efecto.
  useEffect(() => {
    const timerHandle = setTimeout(() => {
      setHasDelayElapsed(true);
    }, delayMs);
    return () => {
      clearTimeout(timerHandle);
    };
  }, [delayMs]);

  if (!hasDelayElapsed) return null;

  return (
    <View
      role="progressbar"
      accessibilityLabel={loadingLabel}
      accessibilityState={{ busy: true }}
      accessible
      style={createScreenSkeletonStyle(theme)}
    >
      <Skeleton width="60%" height={theme.type.titleLg.lineHeight} radius="sm" />
      {Array.from({ length: rowCount }, (_unused, rowIndex) => (
        <View key={rowIndex} style={createRowStyle(theme)}>
          <Skeleton height={AVATAR_PLACEHOLDER_SIZE} shape="circle" />
          <View style={createRowTextStyle(theme)}>
            <Skeleton width="70%" height={theme.type.body.lineHeight} />
            <Skeleton width="40%" height={theme.type.caption.lineHeight} />
          </View>
        </View>
      ))}
    </View>
  );
}
