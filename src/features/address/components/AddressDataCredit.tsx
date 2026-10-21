import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

/**
 * Crédito fijo de las sugerencias de dirección: la licencia de OpenStreetMap (ODbL) y las condiciones de
 * Geoapify piden citar la fuente. Además sale bajo la lista de sugerencias mientras se enseñan.
 */
export function AddressDataCredit(): React.JSX.Element {
  return (
    <Text variant="caption" color="ink2">
      {i18n.t('address.credit')}
    </Text>
  );
}
