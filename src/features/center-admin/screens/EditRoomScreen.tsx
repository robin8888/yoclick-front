import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { RoomListResponseDtoRoomsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RemoveRoomSheet } from '../components/RemoveRoomSheet';
import { RoomFormFields } from '../components/RoomFormFields';
import { useRoomList } from '../hooks/useRoomList';
import { useUpdateRoom } from '../hooks/useUpdateRoom';
import {
  buildRoomForm,
  mapRoomFormToUpdateRequest,
  roomFormSchema,
  type RoomFormValues,
} from '../model/room-form';

const routeParamsSchema = z.object({ roomId: z.string().min(1) });

interface EditRoomActionsProps {
  onSave: () => void;
  onBlocksPress: () => void;
  onRemove: () => void;
}

function EditRoomActions({
  onSave,
  onBlocksPress,
  onRemove,
}: Readonly<EditRoomActionsProps>): React.JSX.Element {
  return (
    <>
      <Button isFullWidth label={i18n.t('centerAdmin.rooms.updateAction')} onPress={onSave} />
      <Button
        isFullWidth
        variant="secondary"
        leadingIconName="lock"
        label={i18n.t('centerAdmin.rooms.blocksAction')}
        onPress={onBlocksPress}
      />
      <Button
        isFullWidth
        variant="outline"
        label={i18n.t('centerAdmin.rooms.removeAction')}
        onPress={onRemove}
      />
    </>
  );
}

/** El formulario de la sala, con su guardado listo para el botón. */
function useEditRoomForm(room: RoomListResponseDtoRoomsItem) {
  const router = useRouter();
  const { control, handleSubmit } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: buildRoomForm(room),
  });
  const update = useUpdateRoom(room.id, router.back);

  return {
    control,
    update,
    save: () => {
      void handleSubmit((formValues) => {
        update.updateRoom(mapRoomFormToUpdateRequest(formValues));
      })();
    },
  };
}

function EditRoomForm({
  room,
}: Readonly<{ room: RoomListResponseDtoRoomsItem }>): React.JSX.Element {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const { control, update, save } = useEditRoomForm(room);

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.rooms.editTitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={update.isUpdating}
      footer={
        <EditRoomActions
          onSave={save}
          onBlocksPress={() => {
            router.push({ pathname: '/(admin)/room-blocks/[roomId]', params: { roomId: room.id } });
          }}
          onRemove={() => {
            setIsRemoving(true);
          }}
        />
      }
    >
      <RoomFormFields control={control} />
      {update.errorMessage === null ? null : <FormErrorBanner message={update.errorMessage} />}
      <RemoveRoomSheet
        room={isRemoving ? room : null}
        onClose={() => {
          setIsRemoving(false);
          router.back();
        }}
      />
    </ScreenTemplate>
  );
}

/** Edita el nombre, el aforo, los servicios y el profesor de un espacio, abre sus bloqueos o lo quita. */
export function EditRoomScreen(): React.JSX.Element {
  const router = useRouter();
  const params = routeParamsSchema.safeParse(useLocalSearchParams());
  const room = useRoomList().data?.rooms.find(
    (candidate) => params.success && candidate.id === params.data.roomId,
  );

  if (room === undefined) {
    return (
      <ScreenTemplate
        title={i18n.t('centerAdmin.rooms.editTitle')}
        onBackPress={router.back}
        backLabel={i18n.t('actions.back')}
      >
        <Text color="ink2">{i18n.t('centerAdmin.rooms.notFound')}</Text>
      </ScreenTemplate>
    );
  }
  return <EditRoomForm room={room} />;
}
