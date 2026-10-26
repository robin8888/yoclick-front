import { View } from 'react-native';

import { AddressField } from '@/features/address';
import { i18n } from '@/shared/i18n';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';

import type { LocationDraft } from '../model/location-draft';
import { ExactPointField } from './ExactPointField';

const SECTION_STYLE = { gap: 8 } as const;
const SWITCH_ROW_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
} as const;
const MAX_LOCATION_NAME_LENGTH = 120;

interface SessionLocationFieldsProps {
  value: LocationDraft;
  onChange: (nextLocation: LocationDraft) => void;
  /** Se enseña bajo el nombre cuando la clase es fuera del centro y aún no lo tiene. */
  nameErrorMessage?: string | undefined;
}

/** El nombre del sitio y su dirección, que solo hacen falta si la clase es fuera del centro. */
function OutsideFields({
  value,
  onChange,
  nameErrorMessage,
}: Readonly<SessionLocationFieldsProps>): React.JSX.Element {
  return (
    <>
      <FormField
        label={i18n.t('centerAdmin.location.nameLabel')}
        placeholder={i18n.t('centerAdmin.location.namePlaceholder')}
        value={value.name}
        maxLength={MAX_LOCATION_NAME_LENGTH}
        errorMessage={nameErrorMessage}
        onChangeText={(name) => {
          onChange({ ...value, name });
        }}
      />
      <AddressField
        label={i18n.t('centerAdmin.location.addressLabel')}
        kind="address"
        value={value.address}
        helperText={i18n.t('centerAdmin.location.addressHelper')}
        onChange={(address) => {
          onChange({ ...value, address });
        }}
      />
      <ExactPointField
        point={value.pin}
        onPointChange={(pin) => {
          onChange({ ...value, pin });
        }}
      />
    </>
  );
}

/**
 * «La clase es fuera del centro»: el nombre del sitio (un parque, un auditorio…) y su dirección con
 * sugerencias. Las personas apuntadas lo ven en su agenda con un botón para llegar.
 */
export function SessionLocationFields({
  value,
  onChange,
  nameErrorMessage,
}: Readonly<SessionLocationFieldsProps>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <View style={SWITCH_ROW_STYLE}>
        <Text variant="bodyStrong">{i18n.t('centerAdmin.location.outsideLabel')}</Text>
        <Switch
          isOn={value.isOutside}
          onToggle={(isOutside) => {
            onChange({ ...value, isOutside });
          }}
          accessibilityLabel={i18n.t('centerAdmin.location.outsideLabel')}
        />
      </View>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.location.outsideHelper')}
      </Text>
      {value.isOutside ? (
        <OutsideFields value={value} onChange={onChange} nameErrorMessage={nameErrorMessage} />
      ) : null}
    </View>
  );
}
