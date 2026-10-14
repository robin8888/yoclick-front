import type { RoomBlockListResponseDtoBlocksItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { ListItem } from '@/ui/molecules/ListItem';

import { describeBlockReason, describeBlockWhen } from '../model/room-block-form';

/** «Pagado» o «Pendiente de pago»; nada si el alquiler no tiene precio. */
function describePaymentState(block: RoomBlockListResponseDtoBlocksItem): string | null {
  if (block.priceCents === null) return null;
  return i18n.t(block.isPaid ? 'centerAdmin.roomBlocks.paid' : 'centerAdmin.roomBlocks.unpaid');
}

/** «Ana Ruiz · 45 € · Pagado» de un alquiler a nombre de una persona; nada en un bloqueo sin más. */
function describeRentalDetail(block: RoomBlockListResponseDtoBlocksItem): string | null {
  if (block.renter === null) return null;
  const price = block.priceCents === null ? null : formatEuros(block.priceCents);
  return [block.renter.fullName, price, describePaymentState(block)]
    .filter((part) => part !== null)
    .join(' · ');
}

interface RoomBlockRowProps {
  block: RoomBlockListResponseDtoBlocksItem;
  timeZone: string;
  onPress: () => void;
}

/** Un bloqueo: cuándo, por qué y la nota; al pulsarlo se ofrece quitarlo. */
export function RoomBlockRow({
  block,
  timeZone,
  onPress,
}: Readonly<RoomBlockRowProps>): React.JSX.Element {
  const when = describeBlockWhen(block, timeZone);
  const reason = describeBlockReason(block.reason);
  const details = [reason, describeRentalDetail(block), block.note].filter(
    (detail): detail is string => detail !== null && detail !== '',
  );

  return (
    <ListItem
      title={when}
      subtitle={details.join(' · ')}
      leadingIconName="lock"
      accessibilityLabel={i18n.t('centerAdmin.roomBlocks.rowLabel', { when, reason })}
      onPress={onPress}
    />
  );
}
