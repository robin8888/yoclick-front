import type { IconName } from '../Icon';
import { Icon } from '../Icon';
import { Spinner } from '../Spinner';

interface ButtonLeadingVisualProps {
  isLoading: boolean;
  iconName: IconName | undefined;
  contentColor: 'onBrand' | 'ink' | 'ink2' | 'brandInk' | 'onDanger' | 'surface';
}

/** Spinner mientras carga, si no el icono opcional; ambos decorativos (el botón ya anuncia «ocupado»). */
export function ButtonLeadingVisual({
  isLoading,
  iconName,
  contentColor,
}: Readonly<ButtonLeadingVisualProps>): React.JSX.Element | null {
  if (isLoading) return <Spinner color={contentColor} />;
  if (iconName === undefined) return null;
  return <Icon name={iconName} color={contentColor} />;
}
