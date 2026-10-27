import type { Href } from 'expo-router';

import type { NotificationListResponseDtoNotificationsItemKind } from '@/shared/api/generated/model';

/** El perfil con el que se mira la bandeja: cada uno tiene sus propias pantallas. */
export type NotificationAudience = 'client' | 'staff' | 'admin';

type NoticeKind = NotificationListResponseDtoNotificationsItemKind;

interface DestinationContext {
  audience: NotificationAudience;
  /** Los datos del aviso (ids de conversación, etc.). */
  noticeData: Readonly<Record<string, string>>;
}

/**
 * Las rutas se guardan como texto y se tipan como `Href` solo al salir: `Href` es una unión enorme
 * y TypeScript no puede combinarla con las 28 reglas.
 */
interface RouteWithParams {
  pathname: string;
  params: Record<string, string>;
}

type Destination = string | RouteWithParams;

type DestinationRule = (context: DestinationContext) => Destination | null;

function byAudience(routes: Partial<Record<NotificationAudience, string>>): DestinationRule {
  return ({ audience }) => routes[audience] ?? null;
}

const AGENDA = byAudience({
  staff: '/(staff)/day-agenda',
  admin: '/(admin)/day-agenda',
});

const MY_BOOKINGS = byAudience({ client: '/(client)/(tabs)/bookings' });
const SUBSCRIPTION = byAudience({ admin: '/(admin)/subscription' });
const MY_PASSES = byAudience({ client: '/(client)/my-passes' });
const PUBLIC_PROFILE = byAudience({
  staff: '/(staff)/public-profile',
  admin: '/(admin)/public-profile',
});
const TEAM_PROFILES = byAudience({ admin: '/(admin)/team/profiles' });

const MESSAGES_ROUTE: Readonly<Record<NotificationAudience, string>> = {
  client: '/(client)/messages',
  staff: '/(staff)/messages',
  admin: '/(admin)/messages',
};

function buildThreadRoute(audience: NotificationAudience, conversationId: string): RouteWithParams {
  switch (audience) {
    case 'client':
      return { pathname: '/(client)/messages/[conversationId]', params: { conversationId } };
    case 'staff':
      return { pathname: '/(staff)/messages/[conversationId]', params: { conversationId } };
    case 'admin':
      return { pathname: '/(admin)/messages/[conversationId]', params: { conversationId } };
  }
}

/** Un mensaje abre su hilo; si el aviso no trae la conversación, la bandeja. */
const MESSAGE: DestinationRule = ({ audience, noticeData }): RouteWithParams => {
  const { conversationId } = noticeData;
  if (conversationId === undefined || conversationId === '')
    return { pathname: MESSAGES_ROUTE[audience], params: {} };
  return buildThreadRoute(audience, conversationId);
};

/**
 * A dónde lleva cada aviso según quién lo mira. Cuando un mismo aviso lo reciben perfiles
 * distintos (una cita nueva la ven el profesor y el centro) cada uno va a su pantalla.
 */
const DESTINATION_BY_KIND: Readonly<Record<NoticeKind, DestinationRule>> = {
  booking_created: AGENDA,
  booking_cancelled: AGENDA,
  booking_rescheduled: AGENDA,
  absence_added: AGENDA,
  booking_created_by_team: MY_BOOKINGS,
  booking_cancelled_by_team: MY_BOOKINGS,
  booking_rescheduled_by_team: MY_BOOKINGS,
  booking_affected_by_absence: MY_BOOKINGS,
  session_cancelled: MY_BOOKINGS,
  schedule_enrolled: MY_BOOKINGS,
  schedule_unenrolled: MY_BOOKINGS,
  routine_assigned: byAudience({ client: '/(client)/(tabs)/practice' }),
  routine_updated: byAudience({ client: '/(client)/(tabs)/practice' }),
  content_assigned: byAudience({ client: '/(client)/(tabs)/practice' }),
  member_joined: byAudience({ admin: '/(admin)/(tabs)/clients' }),
  staff_video_submitted: TEAM_PROFILES,
  staff_video_reviewed: PUBLIC_PROFILE,
  staff_profile_submitted: TEAM_PROFILES,
  staff_profile_reviewed: PUBLIC_PROFILE,
  staff_review_received: PUBLIC_PROFILE,
  privacy_request_received: byAudience({ admin: '/(admin)/privacy' }),
  privacy_request_resolved: byAudience({ client: '/(client)/privacy' }),
  pass_requested: byAudience({ admin: '/(admin)/passes' }),
  pass_activated: MY_PASSES,
  pass_running_low: MY_PASSES,
  pass_exhausted: MY_PASSES,
  room_rental_assigned: MY_PASSES,
  payment_received: byAudience({ admin: '/(admin)/payments' }),
  message_received: MESSAGE,
  waitlist_offer: MY_BOOKINGS,
  waitlist_offer_expired: MY_BOOKINGS,
  pass_rejected: MY_PASSES,
  schedule_updated: MY_BOOKINGS,
  plan_subscribed: SUBSCRIPTION,
  plan_changed: SUBSCRIPTION,
};

/** La pantalla a la que lleva un aviso, o `null` si no hay ninguna que mostrar. */
export function resolveNotificationDestination(
  kind: NoticeKind,
  context: DestinationContext,
): Href | null {
  // El aviso de un hijo lleva al tutor a «Mis hijos», no a sus propias reservas.
  const isAboutChild = (context.noticeData.forChildName ?? '') !== '';
  const isChildNoticeOfGuardian =
    isAboutChild && context.audience === 'client' && kind !== 'message_received';
  const destination: Destination | null = isChildNoticeOfGuardian
    ? '/(client)/children'
    : DESTINATION_BY_KIND[kind](context);
  return destination as Href | null;
}
