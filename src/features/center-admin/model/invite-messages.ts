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

/** Abre WhatsApp (o su web) con el mensaje escrito; la persona elige a quién enviarlo. */
export function buildWhatsAppShareUrl(message: string): string {
  return `${WHATSAPP_SHARE_URL}?text=${encodeURIComponent(message)}`;
}
