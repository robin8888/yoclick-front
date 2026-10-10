import { ServiceOptionList } from '@/features/booking';
import { ClientPicker } from '@/features/clients';
import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { formatShortDate } from '@/shared/lib/format/format-short-date';

import { AppointmentModeFields, RoomChoices } from './AppointmentModeFields';
import { DateNavigator } from './DateNavigator';
import { AppointmentSummary } from './AppointmentSummary';
import { GroupRoomOptionsList } from './GroupRoomOptionsList';
import { AppointmentTimePicker } from './AppointmentTimePicker';
import type { NewAppointmentForm } from '../hooks/useNewAppointmentForm';

function StaffChoices({ form }: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      {form.staff.map((staffMember) => (
        <OptionCard
          key={staffMember.membershipId}
          title={staffMember.fullName}
          isSelected={staffMember.membershipId === form.staffMembershipId}
          onPress={() => {
            form.selectStaff(staffMember.membershipId);
          }}
        />
      ))}
    </>
  );
}

function ClientChoice({ form }: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.clientLabel')}</Text>
      {form.client === null ? (
        <ClientPicker onClientSelect={form.selectClient} />
      ) : (
        <ListItem
          title={form.client.fullName}
          subtitle={i18n.t('staffAgenda.newAppointment.changeClient')}
          leadingIconName="user"
          onPress={form.clearClient}
        />
      )}
    </>
  );
}

/** El día en el que se busca disponibilidad, con flechas como en la agenda. */
function DayChoice({ form }: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.dayLabel')}</Text>
      <DateNavigator
        dateLabel={formatShortDate(`${form.isoDate}T12:00:00.000Z`, 'UTC')}
        onPreviousDay={form.goToPreviousDay}
        onNextDay={form.goToNextDay}
      />
    </>
  );
}

/**
 * Todos los servicios de la academia. Los que el profesional elegido no da llevan una nota y, si se
 * eligen, se explica cómo asignárselos: sin eso no tendría disponibilidad para ese servicio.
 */
function ServiceChoice({ form }: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  const staffMember = form.staff.find((member) => member.membershipId === form.staffMembershipId);
  const givenIds = new Set(form.staffServices.map((service) => service.id));
  const services = (form.services.data?.services ?? []).map((service) =>
    staffMember === undefined || givenIds.has(service.id)
      ? service
      : {
          ...service,
          description: i18n.t('staffAgenda.newAppointment.notGivenByStaff', {
            name: staffMember.fullName,
          }),
        },
  );
  const isChosenNotGiven =
    staffMember !== undefined && form.serviceId !== null && !givenIds.has(form.serviceId);

  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.serviceLabel')}</Text>
      <ServiceOptionList
        services={services}
        selectedServiceId={form.serviceId}
        onServiceSelect={form.selectService}
        onRetry={() => void form.services.refetch()}
        isKindHidden
      />
      {isChosenNotGiven ? (
        <Text color="danger" role="alert">
          {i18n.t('staffAgenda.newAppointment.staffDoesNotGive', { name: staffMember.fullName })}
        </Text>
      ) : null}
    </>
  );
}

/** La hora libre del profesional; con salas, antes el tipo de cita y después la sala. */
function WhenAndWhere({ form }: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <DayChoice form={form} />
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.timeLabel')}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.newAppointment.availabilityHelper')}
      </Text>
      <AppointmentTimePicker
        slots={form.slots}
        timeZone={form.timeZone}
        selectedStartsAt={form.selectedStartsAt}
        onSlotSelect={form.selectSlot}
      />
      {form.hasRooms && form.selectedStartsAt !== null ? <RoomChoices form={form} /> : null}
    </>
  );
}

/** Cita grupal: servicio, día y las salas con sus profesores; el profesor no se elige aparte. */
function GroupAppointmentFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <ServiceChoice form={form} />
      {form.serviceId === null ? (
        <Text color="ink2">{i18n.t('staffAgenda.newAppointment.chooseServiceFirst')}</Text>
      ) : (
        <>
          <DayChoice form={form} />
          <GroupRoomOptionsList form={form} />
        </>
      )}
    </>
  );
}

/** Cita privada: el profesional, su servicio, el día y sus horas libres con sala. */
function PrivateAppointmentFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  const staffWord = getSectorVocabulary(useActiveCenterSectorId()).staff.singular;

  return (
    <>
      <Text variant="titleMd">
        {i18n.t('staffAgenda.newAppointment.staffLabel', { staffWord })}
      </Text>
      <StaffChoices form={form} />
      <ServiceChoice form={form} />
      {form.serviceId === null ||
      form.staffMembershipId === null ||
      !form.staffServices.some((service) => service.id === form.serviceId) ? null : (
        <WhenAndWhere form={form} />
      )}
    </>
  );
}

/**
 * «Nueva cita» en una sola pantalla: alumno y tipo (privada o grupal si el centro tiene salas).
 * En privada se elige el profesional; en grupal la sala y sus profesores salen del servicio.
 */
export function NewAppointmentFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <ClientChoice form={form} />
      {form.hasCenterRooms ? <AppointmentModeFields form={form} /> : null}
      {form.mode === 'group' ? (
        <GroupAppointmentFields form={form} />
      ) : (
        <PrivateAppointmentFields form={form} />
      )}
      <AppointmentSummary form={form} />
    </>
  );
}
