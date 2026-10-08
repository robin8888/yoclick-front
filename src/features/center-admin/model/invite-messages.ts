import { i18n } from '@/shared/i18n';

interface InviteMessageRequest {
  centerName: string;
  joinCode: string;
  joinLink: string;
}

/** El texto listo para enviar por correo, WhatsApp o redes: nombre, código y enlace. */
export function buildInviteMessage({
  centerName,
  joinCode,
  joinLink,
}: InviteMessageRequest): string {
  return i18n.t('centerAdmin.inviteClients.shareMessage', { centerName, joinCode, joinLink });
}

const WHATSAPP_SHARE_URL = 'https://wa.me/';

/**
 * Abre WhatsApp (o su web) con el mensaje escrito. Con teléfono, el chat de esa persona; sin él, la
 * persona elige a quién enviarlo.
 */
export function buildWhatsAppShareUrl(message: string, phone?: string): string {
  const digits = phone?.replace(/\D/g, '') ?? '';
  return `${WHATSAPP_SHARE_URL}${digits}?text=${encodeURIComponent(message)}`;
}

/** Abre la app de mensajes con el chat de ese teléfono y el texto escrito. */
export function buildSmsShareUrl(phone: string, message: string): string {
  return `sms:${phone}?body=${encodeURIComponent(message)}`;
}

const INVITATION_LINK_BASE_URL = 'https://yoclick.app/i/';

/** El mismo formato que abre la app con el código ya puesto (`yoclick://i/…`). */
export function buildInvitationLink(code: string): string {
  return `${INVITATION_LINK_BASE_URL}${encodeURIComponent(code)}`;
}
