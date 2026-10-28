import type { NotificationListResponseDtoNotificationsItem } from '@/shared/api/generated/model';

import { describeNotification, isCancellationNotification } from './describe-notification';

const TIME_ZONE = 'Europe/Madrid';

function buildNotification(
  kind: NotificationListResponseDtoNotificationsItem['kind'],
  noticeData: Record<string, string>,
): NotificationListResponseDtoNotificationsItem {
  return {
    id: 'notification-1',
    kind,
    data: noticeData,
    bookingId: null,
    isRead: false,
    createdAt: '2026-10-07T10:00:00.000Z',
  };
}

const BOOKING_DATA = {
  clientName: 'Ana Pérez',
  serviceName: 'Sesión personal',
  startsAt: '2026-10-08T16:00:00.000Z',
  staffName: 'Marta Gil',
  actorName: 'Carlos Núñez',
};

describe('describeNotification · a class that changes place', () => {
  it('says the new place when only where the class is changes', () => {
    const text = describeNotification(
      buildNotification('schedule_updated', {
        actorName: 'Laura',
        serviceName: 'Yoga',
        label: 'Yoga',
        staffName: '',
        roomName: '',
        placeName: 'Auditorio Municipal',
      }),
      TIME_ZONE,
    );

    expect(text.title).toBe('Ha cambiado un horario tuyo');
    expect(text.description).toBe(
      'Laura ha cambiado el lugar de Yoga. Ahora es en Auditorio Municipal.',
    );
  });

  it('talks about the schedule when the times change too', () => {
    const text = describeNotification(
      buildNotification('schedule_updated', {
        actorName: 'Laura',
        serviceName: 'Yoga',
        label: 'Yoga',
        staffName: 'Ana',
        roomName: 'Aula 2',
      }),
      TIME_ZONE,
    );

    expect(text.description).toContain('ha cambiado el horario de Yoga con Ana');
  });
});

describe('describeNotification', () => {
  it('tells the team about a booking made by a client', () => {
    const text = describeNotification(
      buildNotification('booking_created', BOOKING_DATA),
      TIME_ZONE,
    );

    expect(text.title).toBe('Nueva reserva');
    expect(text.description).toContain('Ana Pérez');
    expect(text.description).toContain('Sesión personal');
  });

  it('tells the client who put an appointment for them', () => {
    const text = describeNotification(
      buildNotification('booking_created_by_team', BOOKING_DATA),
      TIME_ZONE,
    );

    expect(text.title).toBe('Tienes una cita nueva');
    expect(text.description).toBe(
      'Carlos Núñez te ha puesto una cita de Sesión personal el jue 8 oct · 18:00.',
    );
  });

  it('tells the client who cancelled their appointment', () => {
    const text = describeNotification(
      buildNotification('booking_cancelled_by_team', BOOKING_DATA),
      TIME_ZONE,
    );

    expect(text.title).toBe('Han cancelado una cita tuya');
    expect(text.description).toContain('Carlos Núñez ha cancelado tu cita');
  });

  it('tells the client who moved their appointment', () => {
    const text = describeNotification(
      buildNotification('booking_rescheduled_by_team', BOOKING_DATA),
      TIME_ZONE,
    );

    expect(text.title).toBe('Han cambiado la hora de una cita tuya');
    expect(text.description).toContain('Carlos Núñez ha cambiado tu cita');
  });

  it('tells the administration that somebody joined the center', () => {
    const text = describeNotification(
      buildNotification('member_joined', { personName: 'Marta Gil', role: 'staff' }),
      TIME_ZONE,
    );

    expect(text.title).toBe('Alguien nuevo se ha unido');
    expect(text.description).toBe('Marta Gil se ha dado de alta en tu centro.');
  });

  it('tells the client that the routine they practise changed', () => {
    const text = describeNotification(
      buildNotification('routine_updated', { routineName: 'Fuerza base', actorName: 'Marta Gil' }),
      TIME_ZONE,
    );

    expect(text.title).toBe('Han actualizado algo que practicas');
    expect(text.description).toBe('Marta Gil ha cambiado «Fuerza base».');
  });

  it('tells the team that a client moved their appointment', () => {
    const text = describeNotification(
      buildNotification('booking_rescheduled', BOOKING_DATA),
      TIME_ZONE,
    );

    expect(text.title).toBe('Cita cambiada de hora');
  });

  it.each([
    {
      kind: 'routine_assigned',
      noticeData: { routineName: 'Fuerza base', actorName: 'Marta Gil' },
      title: 'Tienes algo nuevo que practicar',
      description: 'Marta Gil te ha asignado «Fuerza base».',
    },
    {
      kind: 'content_assigned',
      noticeData: { contentTitle: 'Guía de calentamiento', actorName: 'Marta Gil' },
      title: 'Tienes contenido nuevo',
      description: 'Marta Gil te ha asignado «Guía de calentamiento».',
    },
    {
      kind: 'staff_video_submitted',
      noticeData: { uploaderName: 'Marta Gil', actorName: 'Marta Gil' },
      title: 'Hay un vídeo por revisar',
      description: 'Marta Gil ha subido su vídeo de presentación y espera tu revisión.',
    },
    {
      kind: 'staff_video_reviewed',
      noticeData: { uploaderName: 'Marta Gil', actorName: 'Carlos Núñez' },
      title: 'Han revisado tu vídeo',
      description:
        'Carlos Núñez ha revisado tu vídeo de presentación. Ábrelo para ver qué ha decidido.',
    },
    {
      kind: 'privacy_request_received',
      noticeData: { clientName: 'Diego Martín', requestKind: 'access' },
      title: 'Nueva solicitud de datos',
      description: 'Diego Martín ha enviado una solicitud: Acceso a los datos.',
    },
    {
      kind: 'privacy_request_resolved',
      noticeData: { requestKind: 'erasure', outcome: 'completed' },
      title: 'Han respondido a tu solicitud',
      description: 'Han atendido tu solicitud: Supresión de datos.',
    },
    {
      kind: 'privacy_request_resolved',
      noticeData: { requestKind: 'rectification', outcome: 'rejected' },
      title: 'Han respondido a tu solicitud',
      description:
        'Han rechazado tu solicitud: Rectificación de datos. Abre la app para ver el motivo.',
    },
    {
      kind: 'staff_profile_submitted',
      noticeData: { staffName: 'Marta Gil', actorName: 'Marta Gil' },
      title: 'Hay un perfil por revisar',
      description: 'Marta Gil ha enviado su perfil profesional y espera tu revisión.',
    },
    {
      kind: 'staff_profile_reviewed',
      noticeData: { staffName: 'Marta Gil', actorName: 'Carlos Núñez', outcome: 'approved' },
      title: 'Han revisado tu perfil',
      description: 'Carlos Núñez ha publicado tu perfil profesional.',
    },
    {
      kind: 'staff_profile_reviewed',
      noticeData: {
        staffName: 'Marta Gil',
        actorName: 'Carlos Núñez',
        outcome: 'changes_requested',
      },
      title: 'Han revisado tu perfil',
      description: 'Carlos Núñez te pide cambios en tu perfil profesional. Ábrelo para verlos.',
    },
    {
      kind: 'staff_review_received',
      noticeData: { authorLabel: 'Ana P.', rating: '5' },
      title: 'Tienes una opinión nueva',
      description: 'Ana P. te ha puntuado con 5 de 5.',
    },
  ] as const)('writes the notice of $kind', ({ kind, noticeData, title, description }) => {
    expect(describeNotification(buildNotification(kind, noticeData), TIME_ZONE)).toEqual({
      title,
      description,
    });
  });

  it('tells the client that the appointment may change because the instructor is away', () => {
    const text = describeNotification(
      buildNotification('booking_affected_by_absence', BOOKING_DATA),
      TIME_ZONE,
    );

    expect(text.title).toBe('Tu cita puede cambiar');
    expect(text.description).toContain('Marta Gil no estará disponible');
  });

  it.each([
    {
      caseName: 'a single day',
      data: { startsOn: '2026-11-23', endsOn: '2026-11-23', affectedBookingCount: '0' },
      expected:
        'Marta Gil no estará: el 23/11/2026. Carlos Núñez lo ha anotado. Ninguna cita afectada.',
    },
    {
      caseName: 'several days with one appointment',
      data: { startsOn: '2026-11-23', endsOn: '2026-11-27', affectedBookingCount: '1' },
      expected:
        'Marta Gil no estará: del 23/11/2026 al 27/11/2026. Carlos Núñez lo ha anotado. 1 cita afectada.',
    },
    {
      caseName: 'several days with many appointments',
      data: { startsOn: '2026-11-23', endsOn: '2026-11-27', affectedBookingCount: '4' },
      expected:
        'Marta Gil no estará: del 23/11/2026 al 27/11/2026. Carlos Núñez lo ha anotado. 4 citas afectadas.',
    },
  ])('describes an absence of $caseName', ({ data: absenceData, expected }) => {
    const text = describeNotification(
      buildNotification('absence_added', { ...BOOKING_DATA, ...absenceData }),
      TIME_ZONE,
    );

    expect(text.title).toBe('Ausencia en el equipo');
    expect(text.description).toBe(expected);
  });
});

describe('isCancellationNotification', () => {
  it.each([
    ['booking_cancelled', true],
    ['booking_cancelled_by_team', true],
    ['booking_created', false],
    ['absence_added', false],
  ] as const)('is %s a cancellation: %s', (kind, isCancellation) => {
    expect(isCancellationNotification(kind)).toBe(isCancellation);
  });
});

describe('describeNotification · fixed schedules', () => {
  const SCHEDULE_DATA = {
    serviceName: 'Inglés B1',
    label: '',
    staffName: 'Marta Gil',
    roomName: 'Aula 2',
    actorName: 'Carlos Núñez',
  };

  it('tells a cancelled day with its room and reason', () => {
    const text = describeNotification(
      buildNotification('session_cancelled', {
        serviceName: 'Salsa',
        startsAt: '2026-10-08T16:00:00.000Z',
        roomName: 'Sala de baile',
        reason: 'Profesora enferma',
        actorName: 'Carlos Núñez',
      }),
      TIME_ZONE,
    );

    expect(text.title).toBe('Han cancelado una clase');
    expect(text.description).toBe(
      'Carlos Núñez ha cancelado Salsa del jue 8 oct · 18:00 en Sala de baile. Motivo: Profesora enferma.',
    );
  });

  it('names the schedule by its service when it has no label', () => {
    const text = describeNotification(
      buildNotification('schedule_enrolled', SCHEDULE_DATA),
      TIME_ZONE,
    );

    expect(text.title).toBe('Tienes un horario fijo nuevo');
    expect(text.description).toBe(
      'Carlos Núñez te ha apuntado a Inglés B1 con Marta Gil en Aula 2.',
    );
  });

  it('uses the label of the schedule and skips the room when there is none', () => {
    const text = describeNotification(
      buildNotification('schedule_unenrolled', {
        ...SCHEDULE_DATA,
        label: 'Inglés B1 – grupo de tarde',
        roomName: '',
      }),
      TIME_ZONE,
    );

    expect(text.title).toBe('Cambio en tu horario fijo');
    expect(text.description).toBe(
      'Carlos Núñez te ha dado de baja de Inglés B1 – grupo de tarde con Marta Gil.',
    );
  });
});

describe('describeNotification · minutes of the AI answering service', () => {
  it.each([
    ['voice_minutes_80', 'El Contestador IA lleva el 80 % de sus minutos'],
    ['voice_minutes_100', 'El Contestador IA ha usado todos sus minutos'],
  ] as const)('says what happened for %s without any invitation to buy', (kind, expectedTitle) => {
    const text = describeNotification(buildNotification(kind, {}), TIME_ZONE);

    expect(text.title).toBe(expectedTitle);
    expect(text.description).not.toMatch(/€|precio|contrat|plan/i);
  });
});
