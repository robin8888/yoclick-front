import { View } from 'react-native';

import type { ServiceListResponseDtoServicesItemStaffItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Icon } from '@/ui/atoms/Icon';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { ANY_STAFF_CHOICE } from '../model/booking-route-params';
import { createAnyStaffAvatarStyle } from './StaffOptionList.styles';

interface StaffOptionListProps {
  staff: readonly ServiceListResponseDtoServicesItemStaffItem[];
  /** `ANY_STAFF_CHOICE` o el `membershipId` de quien se ha elegido. */
  selectedChoice: string;
  onChoiceSelect: (choice: string) => void;
}

function AnyStaffAvatar(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createAnyStaffAvatarStyle(theme)}>
      <Icon name="users" size="navigation" color="ink" />
    </View>
  );
}

/** «Cualquiera disponible» y, debajo, cada profesional que da el servicio. */
export function StaffOptionList({
  staff,
  selectedChoice,
  onChoiceSelect,
}: Readonly<StaffOptionListProps>): React.JSX.Element {
  return (
    <>
      <OptionCard
        leading={<AnyStaffAvatar />}
        title={i18n.t('booking.staff.anyTitle')}
        meta={i18n.t('booking.staff.anyDescription')}
        isSelected={selectedChoice === ANY_STAFF_CHOICE}
        onPress={() => {
          onChoiceSelect(ANY_STAFF_CHOICE);
        }}
      />
      {staff.map((member) => (
        <OptionCard
          key={member.membershipId}
          leading={<Avatar name={member.fullName} size="md" isDecorative />}
          title={member.fullName}
          isSelected={selectedChoice === member.membershipId}
          onPress={() => {
            onChoiceSelect(member.membershipId);
          }}
        />
      ))}
    </>
  );
}
