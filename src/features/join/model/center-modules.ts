import type { MyMembershipsResponseDtoMembershipsItemCenter } from '@/shared/api/generated/model';

export type CenterModules = MyMembershipsResponseDtoMembershipsItemCenter['modules'];

/**
 * Mientras no se conoce el centro (cargando, sin sesión) se enseña todo: es lo que había antes y
 * evita que las pantallas parpadeen al llegar la respuesta.
 */
export const ALL_CENTER_MODULES_ON: CenterModules = {
  content: true,
  attendance: true,
  passes: true,
  waitlist: true,
  rooms: true,
};
