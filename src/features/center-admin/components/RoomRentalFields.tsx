import { View } from 'react-native';
import type { UseFormReturn } from 'react-hook-form';

import { ClientPicker } from '@/features/clients';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { RoomBlockFormValues } from '../model/room-block-form';

const FIELD_STYLE = { gap: 8 } as const;

type RoomBlockForm = UseFormReturn<RoomBlockFormValues>;

/** Elegir a quién se alquila entre las personas registradas del centro. */
function RenterChoice({ form }: Readonly<{ form: RoomBlockForm }>): React.JSX.Element {
  return (
    <>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.roomBlocks.renterHint')}
      </Text>
      <ClientPicker
        onClientSelect={(client) => {
          form.setValue('renterMembershipId', client.membershipId);
          form.setValue('renterName', client.fullName);
        }}
      />
    </>
  );
}

/** La persona elegida, con opción de quitarla, y el precio del alquiler. */
function ChosenRenter({ form }: Readonly<{ form: RoomBlockForm }>): React.JSX.Element {
  return (
    <>
      <Text>{form.watch('renterName')}</Text>
      <Button
        size="sm"
        variant="outline"
        label={i18n.t('centerAdmin.roomBlocks.renterRemove')}
        onPress={() => {
          form.setValue('renterMembershipId', '');
          form.setValue('renterName', '');
          form.setValue('price', '');
        }}
      />
      <FormTextField
        control={form.control}
        name="price"
        label={i18n.t('centerAdmin.roomBlocks.priceLabel')}
        placeholder={i18n.t('centerAdmin.roomBlocks.pricePlaceholder')}
        keyboardType="decimal-pad"
      />
    </>
  );
}

/**
 * Solo en un alquiler: a quién se alquila (una persona registrada) y por cuánto, para que lo pague
 * desde la app si el centro cobra online. Sin persona es un bloqueo sin más.
 */
export function RoomRentalFields({
  form,
}: Readonly<{ form: RoomBlockForm }>): React.JSX.Element | null {
  const { reason, renterMembershipId } = form.watch();
  if (reason !== 'rental') return null;

  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.roomBlocks.renterLabel')}</Text>
      {renterMembershipId === '' ? <RenterChoice form={form} /> : <ChosenRenter form={form} />}
    </View>
  );
}
