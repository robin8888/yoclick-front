import type { RoomBlockListResponseDtoBlocksItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { ListItem } from '@/ui/molecules/ListItem';

import { describeBlockReason, describeBlockWhen } from '../model/room-block-form';

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

  return (
    <ListItem
      title={when}
      subtitle={block.note === null ? reason : `${reason} · ${block.note}`}
      leadingIconName="lock"
      accessibilityLabel={i18n.t('centerAdmin.roomBlocks.rowLabel', { when, reason })}
      onPress={onPress}
    />
  );
}
