import { ScrollView } from 'react-native';

import type { ServiceListResponseDtoServicesItemStaffItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Chip } from '@/ui/atoms/Chip';

import { ANY_STAFF_CHOICE } from '../model/staff-choice';
import { STAFF_CHIPS_STYLE } from './StaffChoiceChips.styles';

interface StaffChoiceChipsProps {
  staff: readonly ServiceListResponseDtoServicesItemStaffItem[];
  /** `ANY_STAFF_CHOICE` o el `membershipId` de quien se ha elegido. */
  selectedChoice: string;
  onChoiceSelect: (choice: string) => void;
  accessibilityLabel: string;
}

/** «Cualquiera disponible» y cada profesional del servicio, en una fila que se desliza. */
export function StaffChoiceChips({
  staff,
  selectedChoice,
  onChoiceSelect,
  accessibilityLabel,
}: Readonly<StaffChoiceChipsProps>): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={STAFF_CHIPS_STYLE}
    >
      <Chip
        selectionRole="radio"
        label={i18n.t('booking.staff.anyTitle')}
        isSelected={selectedChoice === ANY_STAFF_CHOICE}
        onPress={() => {
          onChoiceSelect(ANY_STAFF_CHOICE);
        }}
      />
      {staff.map((member) => (
        <Chip
          key={member.membershipId}
          selectionRole="radio"
          label={member.fullName}
          isSelected={selectedChoice === member.membershipId}
          onPress={() => {
            onChoiceSelect(member.membershipId);
          }}
        />
      ))}
    </ScrollView>
  );
}
