import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import type { useServiceEditorForm } from '../hooks/useServiceEditorForm';
import type { ServiceFormValues } from '../model/service-form';

type ServiceEditorForm = ReturnType<typeof useServiceEditorForm>;
type ServiceMode = ServiceFormValues['mode'];

const FIELD_STYLE = { gap: 8 } as const;

interface ServiceModeFieldProps {
  form: ServiceEditorForm;
}

/** Privado, en grupo o de las dos formas: lo fija el centro; la clientela no elige el modo. */
export function ServiceModeField({ form }: Readonly<ServiceModeFieldProps>): React.JSX.Element {
  return (
    <Controller
      control={form.control}
      name="mode"
      render={({ field }) => (
        <View style={FIELD_STYLE}>
          <Text variant="bodyStrong">{i18n.t('centerAdmin.serviceEditor.modeLabel')}</Text>
          <SegmentedControl<ServiceMode>
            options={[
              { value: 'private', label: i18n.t('centerAdmin.serviceEditor.modePrivate') },
              { value: 'group', label: i18n.t('centerAdmin.serviceEditor.modeGroup') },
              { value: 'both', label: i18n.t('centerAdmin.serviceEditor.modeBoth') },
            ]}
            selectedValue={field.value}
            onValueChange={field.onChange}
          />
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.serviceEditor.modeHelper')}
          </Text>
        </View>
      )}
    />
  );
}
