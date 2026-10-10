import { Controller, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useAssignableStaff } from '../hooks/useAssignableStaff';
import { ANY_TEACHER_VALUE, type RoomFormValues } from '../model/room-form';

const FIELD_STYLE = { gap: 8 } as const;
const CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

interface RoomTeacherFieldProps {
  control: Control<RoomFormValues>;
}

/** Quién da clase en la sala: una persona del equipo o «cualquiera». */
export function RoomTeacherField({ control }: Readonly<RoomTeacherFieldProps>): React.JSX.Element {
  const staff = useAssignableStaff();

  return (
    <Controller
      control={control}
      name="staffMembershipId"
      render={({ field }) => (
        <View style={FIELD_STYLE}>
          <Text variant="bodyStrong">{i18n.t('centerAdmin.rooms.teacherLabel')}</Text>
          <View style={CHIPS_STYLE}>
            <Button
              size="sm"
              variant={field.value === ANY_TEACHER_VALUE ? 'primary' : 'outline'}
              label={i18n.t('centerAdmin.rooms.teacherAnyone')}
              onPress={() => {
                field.onChange(ANY_TEACHER_VALUE);
              }}
            />
            {staff.members.map((member) => (
              <Button
                key={member.membershipId}
                size="sm"
                variant={field.value === member.membershipId ? 'primary' : 'outline'}
                label={member.fullName}
                onPress={() => {
                  field.onChange(member.membershipId);
                }}
              />
            ))}
          </View>
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.rooms.teacherHelper')}
          </Text>
        </View>
      )}
    />
  );
}
