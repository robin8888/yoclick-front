import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { EditRoomsSection } from '../components/ManagementEditSections';
import { RoomFormFields } from '../components/RoomFormFields';
import { useCreateRoom } from '../hooks/useCreateRoom';
import {
  buildEmptyRoomForm,
  mapRoomFormToCreateRequest,
  roomFormSchema,
  type RoomFormValues,
} from '../model/room-form';

/** Prototipo `asvc`, «Nueva sala o recurso»: nombre y aforo; al guardar pide su servicio y horario. */
export function NewRoomScreen(): React.JSX.Element {
  const router = useRouter();
  const { control, handleSubmit } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: buildEmptyRoomForm(),
  });
  // Una sala sin horario no sirve para asignar citas: se sigue directo a ponerle servicio y horario.
  const creation = useCreateRoom((room) => {
    router.replace({
      pathname: '/(admin)/schedules/new',
      params: { roomId: room.id, isNewRoom: 'true' },
    });
  });

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.rooms.newTitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={creation.isCreating}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.rooms.saveAction')}
          onPress={() => {
            void handleSubmit((formValues) => {
              creation.createRoom(mapRoomFormToCreateRequest(formValues));
            })();
          }}
        />
      }
    >
      <RoomFormFields control={control} />
      {creation.errorMessage === null ? null : <FormErrorBanner message={creation.errorMessage} />}
      <EditRoomsSection />
    </ScreenTemplate>
  );
}
