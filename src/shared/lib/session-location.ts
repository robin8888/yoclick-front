import { Linking, Platform } from 'react-native';

import { i18n } from '@/shared/i18n';

/** Dónde se da una clase cuando no es en una sala del centro (un parque, un auditorio…). */
export interface SessionLocationFacts {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

type MapsPlatform = 'ios' | 'android' | 'other';

/** «Lugar: Parque del Retiro · Plaza de la Independencia 7»; sin dirección, solo el nombre. */
export function describeSessionLocation(location: SessionLocationFacts): string {
  if (location.address === null) return i18n.t('booking.location.label', { name: location.name });
  return i18n.t('booking.location.labelWithAddress', {
    name: location.name,
    address: location.address,
  });
}

function buildQuery(location: SessionLocationFacts): string {
  const hasPoint = location.latitude !== null && location.longitude !== null;
  return hasPoint
    ? `${String(location.latitude)},${String(location.longitude)}`
    : `${location.name} ${location.address ?? ''}`.trim();
}

/**
 * El enlace que abre la ruta hasta el lugar en la aplicación de mapas del móvil: Apple Maps en
 * iPhone y Google Maps en Android. Con coordenadas lleva al punto exacto; sin ellas, a lo escrito.
 */
export function buildDirectionsUrl(location: SessionLocationFacts, platform: MapsPlatform): string {
  const query = encodeURIComponent(buildQuery(location));
  if (platform === 'ios') {
    return `https://maps.apple.com/?daddr=${query}&q=${encodeURIComponent(location.name)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

function resolvePlatform(): MapsPlatform {
  if (Platform.OS === 'ios') return 'ios';
  return Platform.OS === 'android' ? 'android' : 'other';
}

/** «Cómo llegar»: abre la ruta en la aplicación de mapas. */
export function openDirections(location: SessionLocationFacts): void {
  void Linking.openURL(buildDirectionsUrl(location, resolvePlatform()));
}
