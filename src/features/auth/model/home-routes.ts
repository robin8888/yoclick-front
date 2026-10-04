import type { HomeDestinationKind } from './resolve-home-destination';

/** Inicio de cada zona (docs/design/pantallas.md); la de `none` es el flujo «Unirse». */
export const HOME_ROUTE_BY_KIND = {
  client: '/(client)/(tabs)/home',
  staff: '/(staff)/(tabs)/agenda',
  admin: '/(admin)/(tabs)/agenda',
  none: '/join',
} as const satisfies Record<HomeDestinationKind, string>;
