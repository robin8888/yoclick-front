import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { useServiceEditorForm } from '../hooks/useServiceEditorForm';
import { DurationPresets } from './DurationPresets';
import { ServiceStaffField } from './ServiceStaffField';

type ServiceEditorForm = ReturnType<typeof useServiceEditorForm>;

const FIELDS_STYLE = { gap: 16 } as const;
const VISIBILITY_ROW_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
} as const;

interface ServiceEditorFieldsProps {
  form: ServiceEditorForm;
}

function VisibilityField({ form }: Readonly<ServiceEditorFieldsProps>): React.JSX.Element {
  return (
    <Controller
      control={form.control}
      name="isVisible"
      render={({ field }) => (
        <View style={VISIBILITY_ROW_STYLE}>
          <Text variant="bodyStrong">{i18n.t('centerAdmin.serviceEditor.visibleLabel')}</Text>
          <Switch
            isOn={field.value}
            onToggle={field.onChange}
            accessibilityLabel={i18n.t('centerAdmin.serviceEditor.visibleLabel')}
          />
        </View>
      )}
    />
  );
}

/** Los campos de un servicio: nombre, descripción, duración, precio, quién lo da y visibilidad. */
export function ServiceEditorFields({
  form,
}: Readonly<ServiceEditorFieldsProps>): React.JSX.Element {
  return (
    <View style={FIELDS_STYLE}>
      <FormTextField
        control={form.control}
        name="name"
        label={i18n.t('centerAdmin.serviceEditor.nameLabel')}
      />
      <FormTextField
        control={form.control}
        name="description"
        label={i18n.t('centerAdmin.serviceEditor.descriptionLabel')}
        placeholder={i18n.t('centerAdmin.serviceEditor.descriptionPlaceholder')}
      />
      <DurationPresets
        selectedMinutes={form.watchedDurationMinutes}
        onMinutesSelect={(minutes) => {
          form.setValue('durationMinutes', minutes, { shouldValidate: true });
        }}
      />
      <FormTextField
        control={form.control}
        name="durationMinutes"
        label={i18n.t('centerAdmin.serviceEditor.durationMinutesLabel')}
        keyboardType="number-pad"
      />
      <FormTextField
        control={form.control}
        name="priceInEuros"
        label={i18n.t('centerAdmin.serviceEditor.priceLabel')}
        helperText={i18n.t('centerAdmin.serviceEditor.priceHelper')}
        keyboardType="decimal-pad"
      />
      <ServiceStaffField form={form} />
      <VisibilityField form={form} />
    </View>
  );
}
