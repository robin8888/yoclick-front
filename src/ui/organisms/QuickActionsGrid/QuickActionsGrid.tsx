import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import type { IconName } from '@/ui/atoms/Icon';

import { PrimaryQuickAction, QuickActionTile } from './QuickActionTile';
import {
  createQuickActionsRowStyle,
  createQuickActionsStackStyle,
} from './QuickActionsGrid.styles';

export interface QuickAction {
  id: string;
  iconName: IconName;
  label: string;
  /** Una línea que aclara para qué sirve el acceso. */
  hint: string;
  /** Pendientes (mensajes sin leer): sale como un círculo con el número. */
  badgeCount?: number | undefined;
  onPress: () => void;
}

const TILES_PER_ROW = 2;

/** De dos en dos; si sobra uno, ocupa toda la fila: nunca queda un hueco ni un botón estrecho. */
function chunkIntoRows(actions: readonly QuickAction[]): QuickAction[][] {
  const rows: QuickAction[][] = [];
  for (let index = 0; index < actions.length; index += TILES_PER_ROW) {
    rows.push(actions.slice(index, index + TILES_PER_ROW));
  }
  return rows;
}

interface QuickActionsGridProps {
  /** La acción que más se usa: a todo el ancho y con el color de la marca. */
  primaryAction: QuickAction;
  actions: readonly QuickAction[];
}

/**
 * Los accesos de una pantalla de inicio: la acción principal arriba y debajo una cuadrícula de
 * tarjetas limpias. La usan el inicio del centro y el del profesor.
 */
export function QuickActionsGrid({
  primaryAction,
  actions,
}: Readonly<QuickActionsGridProps>): React.JSX.Element {
  const theme = useTheme();
  const { id: primaryId, ...primaryProps } = primaryAction;

  return (
    <View style={createQuickActionsStackStyle(theme)}>
      <PrimaryQuickAction key={primaryId} {...primaryProps} />
      {chunkIntoRows(actions).map((row) => (
        <View key={row.map(({ id }) => id).join('-')} style={createQuickActionsRowStyle(theme)}>
          {row.map(({ id, ...tile }) => (
            <QuickActionTile key={id} {...tile} />
          ))}
        </View>
      ))}
    </View>
  );
}
