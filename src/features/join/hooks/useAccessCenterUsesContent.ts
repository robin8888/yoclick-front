import { useQuery } from '@tanstack/react-query';

import { getCentersGetBrandingQueryOptions } from '@/shared/api/generated/endpoints/centers/centers';

import { useAccessCenter } from './useAccessCenter';

/**
 * Si el centro por el que entra la persona usa contenido y práctica (rutinas, vídeos…). Sin él no
 * tiene sentido preguntarle por su experiencia ni sus objetivos al registrarse. Mientras no se sabe
 * (sin centro o cargando) se responde que sí: es el camino de siempre.
 */
export function useAccessCenterUsesContent(): boolean {
  const accessCenterId = useAccessCenter()?.id;
  const { data: branding } = useQuery(
    getCentersGetBrandingQueryOptions(accessCenterId ?? '', {
      query: { enabled: accessCenterId !== undefined },
    }),
  );
  return branding?.modules.content ?? true;
}
