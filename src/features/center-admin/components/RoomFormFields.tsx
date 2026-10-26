import { Controller, type Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { RoomFormValues } from '../model/room-form';
import { RoomPlaceFields } from './RoomPlaceFields';

interface RoomFormFieldsProps {
  control: Control<RoomFormValues>;
}

/** Una sala es su nombre, su aforo y, si es exterior, dónde está: el profesor y el servicio se eligen en cada clase. */
export function RoomFormFields({ control }: Readonly<RoomFormFieldsProps>): React.JSX.Element {
  return (
    <>
      <FormTextField
        control={control}
        name="name"
        label={i18n.t('centerAdmin.rooms.nameLabel')}
        placeholder={i18n.t('centerAdmin.rooms.namePlaceholder')}
      />
      <FormTextField
        control={control}
        name="capacity"
        label={i18n.t('centerAdmin.rooms.capacityLabel')}
        helperText={i18n.t('centerAdmin.rooms.capacityHelper')}
        keyboardType="number-pad"
      />
      <Controller
        control={control}
        name="place"
        render={({ field }) => <RoomPlaceFields value={field.value} onChange={field.onChange} />}
      />
    </>
  );
}
