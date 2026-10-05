import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';

import type { CenterDetailsFormValues } from '../schemas/center-details.schema';
import { LISTED_FIELD_STYLE, LISTED_TEXT_STYLE } from './ListedInSearchField.styles';

interface ListedInSearchFieldProps {
  control: Control<CenterDetailsFormValues>;
}

/** «Aparecer en el buscador»: apagado, el centro es privado y solo se entra con su código. */
export function ListedInSearchField({
  control,
}: Readonly<ListedInSearchFieldProps>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name="isListed"
      render={({ field }) => (
        <View style={LISTED_FIELD_STYLE}>
          <View style={LISTED_TEXT_STYLE}>
            <Text variant="bodyStrong">{i18n.t('onboarding.center.listedLabel')}</Text>
            <Text variant="caption" color="ink2">
              {i18n.t('onboarding.center.listedHelper')}
            </Text>
          </View>
          <Switch
            isOn={field.value}
            onToggle={field.onChange}
            accessibilityLabel={i18n.t('onboarding.center.listedLabel')}
          />
        </View>
      )}
    />
  );
}
