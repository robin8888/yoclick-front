import { View } from 'react-native';

import { AddressField } from '@/features/address';
import { i18n } from '@/shared/i18n';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';

import type { RoomPlaceDraft } from '../model/room-form';
import { ExactPointField } from './ExactPointField';

const SECTION_STYLE = { gap: 8 } as const;
const SWITCH_ROW_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
} as const;

interface RoomPlaceFieldsProps {
  value: RoomPlaceDraft;
  onChange: (nextPlace: RoomPlaceDraft) => void;
}

/** La dirección y el punto exacto, que solo hacen falta si la sala es un espacio exterior. */
function OutdoorPlaceInputs({
  value,
  onChange,
}: Readonly<RoomPlaceFieldsProps>): React.JSX.Element {
  return (
    <>
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
 * «Es un espacio exterior»: un parque, un auditorio o cualquier sitio fuera del centro. Se pone su
 * dirección y, si no se tiene, el punto exacto con el GPS del móvil o pegando un enlace. Las clases
 * que se den en la sala lo heredan y las personas apuntadas lo ven en su agenda.
 */
export function RoomPlaceFields({
  value,
  onChange,
}: Readonly<RoomPlaceFieldsProps>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <View style={SWITCH_ROW_STYLE}>
        <Text variant="bodyStrong">{i18n.t('centerAdmin.rooms.outdoorLabel')}</Text>
        <Switch
          isOn={value.isOutdoor}
          onToggle={(isOutdoor) => {
            onChange({ ...value, isOutdoor });
          }}
          accessibilityLabel={i18n.t('centerAdmin.rooms.outdoorLabel')}
        />
      </View>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.rooms.outdoorHelper')}
      </Text>
      {value.isOutdoor ? <OutdoorPlaceInputs value={value} onChange={onChange} /> : null}
    </View>
  );
}
