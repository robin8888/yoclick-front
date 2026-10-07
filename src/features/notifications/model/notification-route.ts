import type { Href } from 'expo-router';

/** A dónde lleva tocar un aviso: a la lista de avisos de la zona de quien lo recibe. */
export function getNotificationsRoute(role: string | undefined): Href {
  if (role === 'client') return '/(client)/notifications';
  if (role === 'staff') return '/(staff)/(tabs)/notifications';
  return '/(admin)/(tabs)/notifications';
}
