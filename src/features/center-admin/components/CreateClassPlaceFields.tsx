import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { RoomCard } from './RoomCard';
import type { CreateClassForm } from '../hooks/useCreateClassForm';

const SECTION_STYLE = { gap: 8 } as const;
const MAX_NAME_LENGTH = 80;

function SectionTitle({ title }: Readonly<{ title: string }>): React.JSX.Element {
  return (
    <Text variant="titleMd" role="heading">
      {title}
    </Text>
  );
}

/** «12 personas» y, si la sala es un espacio exterior, también «Exterior · Parque del Retiro». */
function describeRoom(room: CreateClassForm['rooms'][number]): string {
  const capacityLabel = i18n.t('centerAdmin.createClass.roomCapacity', { count: room.capacity });
  if (room.place === null) return capacityLabel;
  const outdoorLabel = i18n.t('centerAdmin.createClass.roomOutdoor', {
    place: room.place.address ?? room.name,
  });
  return `${capacityLabel} · ${outdoorLabel}`;
}

function RoomChoice({ form }: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <SectionTitle title={i18n.t('centerAdmin.createClass.roomTitle')} />
      {form.rooms.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.createClass.noRooms')}</Text>
      ) : null}
      {form.rooms.map((room, position) => (
        <RoomCard
          key={room.id}
          name={room.name}
          position={position}
          subtitle={describeRoom(room)}
          accessibilityLabel={room.name}
          isSelected={form.draft.roomId === room.id}
          onPress={() => {
            form.chooseRoom(room.id);
          }}
        />
      ))}
    </View>
  );
}

function ServiceChoice({ form }: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <SectionTitle title={i18n.t('centerAdmin.createClass.serviceTitle')} />
      {form.services.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.createClass.noServices')}</Text>
      ) : null}
      {form.services.map((service) => (
        <OptionCard
          key={service.id}
          title={service.name}
          meta={i18n.t('centerAdmin.createClass.serviceDuration', {
            count: service.durationMinutes,
          })}
          isSelected={form.draft.serviceId === service.id}
          onPress={() => {
            form.chooseService(service.id);
          }}
        />
      ))}
    </View>
  );
}

function TeacherChoice({ form }: Readonly<{ form: CreateClassForm }>): React.JSX.Element | null {
  if (form.draft.serviceId === null) return null;
  return (
    <View style={SECTION_STYLE}>
      <SectionTitle title={i18n.t('centerAdmin.createClass.teacherTitle')} />
      {form.isTeacherOptional ? (
        <Text color="ink2">{i18n.t('centerAdmin.createClass.teacherOptionalHint')}</Text>
      ) : null}
      {form.teachers.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.createClass.noTeachers')}</Text>
      ) : null}
      {form.teachers.map((teacher) => (
        <OptionCard
          key={teacher.membershipId}
          title={teacher.fullName}
          isSelected={form.draft.staffMembershipId === teacher.membershipId}
          onPress={() => {
            form.chooseTeacher(teacher.membershipId);
          }}
        />
      ))}
    </View>
  );
}

/** El nombre de la clase, la sala, el servicio y el profesor que da ese servicio. */
export function CreateClassPlaceFields({
  form,
}: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  return (
    <>
      <FormField
        label={i18n.t('centerAdmin.createClass.nameLabel')}
        placeholder={i18n.t('centerAdmin.createClass.namePlaceholder')}
        value={form.draft.label}
        onChangeText={form.setLabel}
        maxLength={MAX_NAME_LENGTH}
      />
      <RoomChoice form={form} />
      <ServiceChoice form={form} />
      <TeacherChoice form={form} />
    </>
  );
}
