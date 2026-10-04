import type { IconName } from '@/ui/atoms/Icon';

/**
 * Un vacío nunca deja al usuario en un callejón sin salida: la siguiente acción es obligatoria
 * (docs/design/pantallas.md › `stempty`). El texto lo pone la pantalla, con el vocabulario del sector.
 */
export interface EmptyStateProps {
  iconName: IconName;
  title: string;
  description?: string;
  actionLabel: string;
  onActionPress: () => void;
}
