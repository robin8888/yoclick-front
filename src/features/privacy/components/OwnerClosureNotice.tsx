import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ConsentCheckbox } from '@/ui/molecules/ConsentCheckbox';

import { SECTION_STYLE } from './Privacy.styles';

interface OwnerClosureNoticeProps {
  /** Los centros de los que es propietario: se cerrarán al eliminar la cuenta. */
  centerNames: readonly string[];
  isAcknowledged: boolean;
  onAcknowledgedChange: (isAcknowledged: boolean) => void;
}

/**
 * Aviso para quien es propietario de un centro: borrar la cuenta cierra el centro. Hay que marcar que se
 * entiende antes de poder confirmar, porque el cierre cancela la suscripción y no se puede deshacer.
 */
export function OwnerClosureNotice({
  centerNames,
  isAcknowledged,
  onAcknowledgedChange,
}: Readonly<OwnerClosureNoticeProps>): React.JSX.Element {
  const count = centerNames.length;

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" color="warning">
        {i18n.t('privacy.delete.ownerTitle', { count })}
      </Text>
      <Text color="ink2">
        {i18n.t('privacy.delete.ownerNotice', { count, centers: centerNames.join(', ') })}
      </Text>
      <ConsentCheckbox
        isChecked={isAcknowledged}
        onCheckedChange={onAcknowledgedChange}
        label={i18n.t('privacy.delete.ownerAcknowledge')}
      />
    </View>
  );
}
