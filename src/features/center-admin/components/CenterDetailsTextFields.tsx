import { useWatch, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { FormAddressField, getCountryCodeForTimeZone } from '@/features/address';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { CenterDetailsFormValues } from '../model/center-details-form';
import { CHOICE_FIELD_STYLE } from './CenterDetailsChoiceFields.styles';

interface TextFieldsProps {
  control: Control<CenterDetailsFormValues>;
}

/** Dirección, teléfono y correo que ve la clientela. */
export function ContactFields({ control }: Readonly<TextFieldsProps>): React.JSX.Element {
  const countryCode = getCountryCodeForTimeZone(useWatch({ control, name: 'timezone' }));

  return (
    <View style={CHOICE_FIELD_STYLE}>
      <Text variant="titleMd">{i18n.t('centerAdmin.details.contactTitle')}</Text>
      <FormAddressField
        control={control}
        name="address"
        kind="address"
        countryCode={countryCode}
        label={i18n.t('centerAdmin.details.addressLabel')}
      />
      <FormTextField
        control={control}
        name="phone"
        label={i18n.t('centerAdmin.details.phoneLabel')}
        keyboardType="phone-pad"
      />
      <FormTextField
        control={control}
        name="contactEmail"
        label={i18n.t('centerAdmin.details.emailLabel')}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  );
}

/** Razón social, CIF/NIF y dirección fiscal: solo los ve la administración. */
export function FiscalFields({ control }: Readonly<TextFieldsProps>): React.JSX.Element {
  const countryCode = getCountryCodeForTimeZone(useWatch({ control, name: 'timezone' }));

  return (
    <View style={CHOICE_FIELD_STYLE}>
      <Text variant="titleMd">{i18n.t('centerAdmin.details.fiscalTitle')}</Text>
      <FormTextField
        control={control}
        name="legalName"
        label={i18n.t('centerAdmin.details.legalNameLabel')}
      />
      <FormTextField
        control={control}
        name="taxId"
        label={i18n.t('centerAdmin.details.taxIdLabel')}
        helperText={i18n.t('centerAdmin.details.taxIdHelper')}
        autoCapitalize="characters"
      />
      <FormAddressField
        control={control}
        name="taxAddress"
        kind="address"
        countryCode={countryCode}
        label={i18n.t('centerAdmin.details.taxAddressLabel')}
      />
    </View>
  );
}
