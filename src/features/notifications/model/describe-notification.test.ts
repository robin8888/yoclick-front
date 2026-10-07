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

  it.each([
    {
      kind: 'routine_assigned',
      noticeData: { routineName: 'Fuerza base', actorName: 'Marta Gil' },
      title: 'Tienes algo nuevo que practicar',
      description: 'Marta Gil te ha asignado «Fuerza base».',
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
