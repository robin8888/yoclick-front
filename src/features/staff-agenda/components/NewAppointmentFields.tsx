import { ServiceOptionList } from '@/features/booking';
import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { AppointmentModeFields, RoomChoices } from './AppointmentModeFields';
import { ClientChoiceField } from './ClientChoiceField';
import { AppointmentDayCalendar } from './AppointmentDayCalendar';
import { AppointmentSummary } from './AppointmentSummary';
import { GroupRoomOptionsList } from './GroupRoomOptionsList';
import { AppointmentTimePicker } from './AppointmentTimePicker';
import { ScheduledServiceFields } from './ScheduledServiceFields';
import { useServiceSessions } from '@/features/booking';
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

function ClientChoice({
  form,
  canChooseSeveral,
}: Readonly<{ form: NewAppointmentForm; canChooseSeveral: boolean }>): React.JSX.Element {
  return (
    <ClientChoiceField
      clients={form.clients}
      canChooseSeveral={canChooseSeveral}
      onClientToggle={(client) => {
        form.toggleClient(client, { canChooseSeveral });
      }}
      onClientsClear={form.clearClients}
    />
  );
}

/** El día en el que se busca disponibilidad, en un calendario como el del iPhone. */
function DayChoice({ form }: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.dayLabel')}</Text>
      <AppointmentDayCalendar selectedIsoDate={form.isoDate} onDateSelect={form.selectDate} />
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

/** Cita grupal sin horario de sala: el día y las salas con sus profesores. */
function GroupAppointmentFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <DayChoice form={form} />
      <GroupRoomOptionsList form={form} />
    </>
  );
}

/** Cita privada sin horario de sala: el profesional, el día y sus horas libres con sala. */
function PrivateAppointmentFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  const staffWord = getSectorVocabulary(useActiveCenterSectorId()).staff.singular;
  const isServiceGivenByStaff = form.staffServices.some((service) => service.id === form.serviceId);

  return (
    <>
      <Text variant="titleMd">
        {i18n.t('staffAgenda.newAppointment.staffLabel', { staffWord })}
      </Text>
      <StaffChoices form={form} />
      {form.staffMembershipId === null || !isServiceGivenByStaff ? null : (
        <WhenAndWhere form={form} />
      )}
    </>
  );
}

/** Un servicio sin horario de sala: privada o grupal y, como siempre, la hora libre del profesional. */
function FreeAppointmentFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      {form.hasCenterRooms ? <AppointmentModeFields form={form} /> : null}
      {form.mode === 'group' ? (
        <GroupAppointmentFields form={form} />
      ) : (
        <PrivateAppointmentFields form={form} />
      )}
    </>
  );
}

/** Qué se pide después de elegir el servicio: sus clases, o la hora libre si no tiene horario. */
function AfterService({
  form,
  serviceSessions,
}: Readonly<{
  form: NewAppointmentForm;
  serviceSessions: ReturnType<typeof useServiceSessions>;
}>): React.JSX.Element | null {
  if (form.serviceId === null) {
    return <Text color="ink2">{i18n.t('staffAgenda.newAppointment.chooseServiceFirst')}</Text>;
  }
  if (serviceSessions.isLoading) {
    return <Text color="ink2">{i18n.t('staffAgenda.newAppointment.loadingClasses')}</Text>;
  }
  if (serviceSessions.data?.isScheduled === true) {
    return <ScheduledServiceFields form={form} sessions={serviceSessions.data} />;
  }
  return <FreeAppointmentFields form={form} />;
}

/**
 * «Nueva cita» en una sola pantalla: primero a quién y el servicio. Si el servicio tiene horario
 * de sala se elige entre sus clases con plazas; si no, como siempre: tipo, profesional y hora libre.
 */
export function NewAppointmentFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  const serviceSessions = useServiceSessions(form.serviceId);
  const isScheduledService = serviceSessions.data?.isScheduled === true;

  return (
    <>
      <ClientChoice form={form} canChooseSeveral={form.mode === 'group' || isScheduledService} />
      <ServiceChoice form={form} />
      <AfterService form={form} serviceSessions={serviceSessions} />
      <AppointmentSummary form={form} />
    </>
  );
}
