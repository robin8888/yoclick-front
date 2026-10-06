import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import type { ClientLevelId } from '../model/client-display';
import { createLevelDotStyle, createLevelPillStyle } from './LevelPill.styles';

interface LevelPillProps {
  level: ClientLevelId;
  /** Nivel ya escrito con el vocabulario del sector («Inicio», «Base», «Avanzado»). */
  label: string;
}

/** Prototipo `iclients`: el nivel como pastilla con un punto; el avanzado va en azul. */
export function LevelPill({ level, label }: Readonly<LevelPillProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View accessible accessibilityLabel={label} style={createLevelPillStyle(theme, level)}>
      <View style={createLevelDotStyle(theme, level)} />
      <Text variant="caption" color={level === 'advanced' ? 'info' : 'ink'}>
        {label}
      </Text>
    </View>
  );
}
