import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RoomFormFields } from '../components/RoomFormFields';
import { useCreateRoom } from '../hooks/useCreateRoom';
import {
  buildEmptyRoomForm,
  mapRoomFormToCreateRequest,
  roomFormSchema,
  type RoomFormValues,
} from '../model/room-form';

/** Prototipo `asvc`, «Nueva sala o recurso»: nombre y aforo máximo. */
export function NewRoomScreen(): React.JSX.Element {
  const router = useRouter();
  const { control, handleSubmit } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: buildEmptyRoomForm(),
  });
  const creation = useCreateRoom(router.back);

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
    </ScreenTemplate>
  );
}
