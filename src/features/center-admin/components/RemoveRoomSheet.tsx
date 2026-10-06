import type { RoomListResponseDtoRoomsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import { useArchiveRoom } from '../hooks/useArchiveRoom';

interface RemoveRoomSheetProps {
  /** La sala que se quiere quitar; `null` mantiene la hoja cerrada. */
  room: RoomListResponseDtoRoomsItem | null;
  onClose: () => void;
}

/** Confirmación de «Quitar sala»: los servicios que la usaban quedan sin sala fija. */
export function RemoveRoomSheet({
  room,
  onClose,
}: Readonly<RemoveRoomSheetProps>): React.JSX.Element {
  const archive = useArchiveRoom();

  return (
    <>
      {archive.errorMessage === null ? null : <FormErrorBanner message={archive.errorMessage} />}
      <ConfirmSheet
        isVisible={room !== null}
        title={i18n.t('centerAdmin.rooms.removeTitle')}
        message={i18n.t('centerAdmin.rooms.removeMessage', { name: room?.name ?? '' })}
        confirmLabel={i18n.t('centerAdmin.rooms.removeConfirm')}
        dismissLabel={i18n.t('actions.cancel')}
        isConfirming={archive.isArchiving}
        isDestructive
        onConfirm={() => {
          if (room !== null) archive.archiveRoom(room.id, onClose);
        }}
        onDismiss={onClose}
      />
    </>
  );
}
