import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm, useFormState, type UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { getTodayIsoDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { FormTextField } from '@/ui/molecules/FormTextField';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ChoiceChipsField } from '../components/ChoiceChipsField';
import { SpanishDateField } from '../components/SpanishDateField';
import { TimeRangeStepFields } from '../components/TimeRangeStepFields';
import { getDeviceTimeZone, useCenterTimeZone } from '../hooks/useCenterTimeZone';
import { useCreateRoomBlock } from '../hooks/useCreateRoomBlock';
import {
  buildEmptyRoomBlockForm,
  describeBlockReason,
  mapRoomBlockFormToRequest,
  ROOM_BLOCK_REASONS,
  roomBlockFormSchema,
  type RoomBlockFormValues,
} from '../model/room-block-form';
import { roomBlocksRouteParamsSchema } from '../model/room-blocks-route-params';
import { stepTime } from '../model/schedule-form';

type RoomBlockForm = UseFormReturn<RoomBlockFormValues>;

const FIELD_STYLE = { gap: 8 } as const;

function BlockDateField({ form }: Readonly<{ form: RoomBlockForm }>): React.JSX.Element {
  const { errors } = useFormState({ control: form.control });

  return (
    <Controller
      control={form.control}
      name="date"
      render={({ field }) => (
        <View style={FIELD_STYLE}>
          <Text variant="bodyStrong">{i18n.t('centerAdmin.roomBlocks.dateLabel')}</Text>
          <SpanishDateField
            value={field.value}
            onValueChange={field.onChange}
            accessibilityLabel={i18n.t('centerAdmin.roomBlocks.dateLabel')}
          />
          {errors.date === undefined ? null : (
            <Text variant="caption" color="danger" role="alert">
              {errors.date.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

function BlockTimeAndReasonFields({ form }: Readonly<{ form: RoomBlockForm }>): React.JSX.Element {
  const values = form.watch();
  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <TimeRangeStepFields
        title={i18n.t('centerAdmin.roomBlocks.timeLabel')}
        startName={i18n.t('centerAdmin.roomBlocks.timeFrom')}
        endName={i18n.t('centerAdmin.roomBlocks.timeUntil')}
        startsAtTime={values.startsAtTime}
        endsAtTime={values.endsAtTime}
        errorMessage={errors.endsAtTime?.message}
        onStartStep={(direction) => {
          form.setValue('startsAtTime', stepTime(values.startsAtTime, direction));
        }}
        onEndStep={(direction) => {
          form.setValue('endsAtTime', stepTime(values.endsAtTime, direction));
        }}
      />
      <ChoiceChipsField
        title={i18n.t('centerAdmin.roomBlocks.reasonLabel')}
        options={ROOM_BLOCK_REASONS.map((reason) => ({
          value: reason,
          label: describeBlockReason(reason),
        }))}
        selectedValue={values.reason}
        onValueChange={(reason) => {
          const knownReason = ROOM_BLOCK_REASONS.find((candidate) => candidate === reason);
          if (knownReason !== undefined) form.setValue('reason', knownReason);
        }}
      />
    </>
  );
}

function NewRoomBlockContent({ roomId }: Readonly<{ roomId: string }>): React.JSX.Element {
  const router = useRouter();
  const timeZone = useCenterTimeZone();
  const creation = useCreateRoomBlock(roomId);
  const form = useForm<RoomBlockFormValues>({
    resolver: zodResolver(roomBlockFormSchema),
    defaultValues: buildEmptyRoomBlockForm(getTodayIsoDate(new Date(), getDeviceTimeZone())),
  });

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.roomBlocks.newTitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={creation.isCreating}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.roomBlocks.saveAction')}
          // Sin la zona del centro no se puede convertir la hora local a UTC.
          isDisabled={timeZone === null}
          onPress={() => {
            if (timeZone === null) return;
            void form.handleSubmit((formValues) => {
              creation.createBlock(mapRoomBlockFormToRequest(formValues, timeZone), router.back);
            })();
          }}
        />
      }
    >
      <BlockDateField form={form} />
      <BlockTimeAndReasonFields form={form} />
      <FormTextField
        control={form.control}
        name="note"
        label={i18n.t('centerAdmin.roomBlocks.noteLabel')}
        placeholder={i18n.t('centerAdmin.roomBlocks.notePlaceholder')}
      />
      {creation.errorMessage === null ? null : <FormErrorBanner message={creation.errorMessage} />}
    </ScreenTemplate>
  );
}

/** «Nuevo bloqueo»: día, tramo, motivo y nota; el espacio queda fuera de uso en ese tramo. */
export function NewRoomBlockScreen(): React.JSX.Element {
  const params = roomBlocksRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(admin)/(tabs)/management" />;
  return <NewRoomBlockContent roomId={params.data.roomId} />;
}
