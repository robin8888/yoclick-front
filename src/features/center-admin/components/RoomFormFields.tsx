import type { Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { RoomFormValues } from '../model/room-form';
import { Controller } from 'react-hook-form';

import { RoomFixedServiceField } from './RoomFixedServiceField';
import { RoomTeacherField } from './RoomTeacherField';
import { ServiceSelectionField } from './ServiceSelectionField';

interface RoomFormFieldsProps {
  control: Control<RoomFormValues>;
}

/** Nombre, aforo máximo, servicios, servicio fijo y profesor de un espacio. */
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
        name="serviceIds"
        render={({ field }) => (
          <ServiceSelectionField
            title={i18n.t('centerAdmin.rooms.servicesLabel')}
            helperText={i18n.t('centerAdmin.rooms.servicesHelper')}
            selectedServiceIds={field.value}
            onSelectedServiceIdsChange={field.onChange}
          />
        )}
      />
      <RoomFixedServiceField control={control} />
      <RoomTeacherField control={control} />
    </>
  );
}
