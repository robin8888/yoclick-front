import type {
  CenterBrandingResponseDto,
  CenterSearchResponseDtoCentersItem,
  PublicCenterResponseDto,
} from '@/shared/api/generated/model';

/** El centro que la persona ha elegido unirse; la app se viste con su marca desde ese momento. */
export interface PendingCenter {
  readonly id: string;
  readonly name: string;
  readonly sectorId: string;
  readonly brandHexColor: string;
  /** Ruta relativa del logo en la API (`/v1/centers/{id}/logo?v=…`); `null` si no tiene. */
  readonly logoUrl: string | null;
  /** Solo si entró con código: un centro privado lo exige al unirse. */
  readonly joinCode?: string | undefined;
  /** Por dónde llegó (QR, enlace, código o buscador): el centro cuenta «este mes se han unido». */
  readonly joinSource?: JoinSource | undefined;
}

export type JoinSource = 'qr' | 'link' | 'code' | 'search';

interface CenterWithBrand {
  id: string;
  name: string;
  sectorId: string;
  brandColor: string;
  logoUrl: string | null;
}

function mapCenterToPendingCenter(
  center: CenterWithBrand,
  joinCode?: string,
  joinSource?: JoinSource,
): PendingCenter {
  return {
    id: center.id,
    name: center.name,
    sectorId: center.sectorId,
    brandHexColor: center.brandColor,
    logoUrl: center.logoUrl,
    joinCode,
    joinSource,
  };
}

export function mapPublicCenterToPendingCenter(
  center: PublicCenterResponseDto,
  joinCode: string,
  joinSource: JoinSource = 'code',
): PendingCenter {
  return mapCenterToPendingCenter(center, joinCode, joinSource);
}

export function mapSearchResultToPendingCenter(
  center: CenterSearchResponseDtoCentersItem,
): PendingCenter {
  return mapCenterToPendingCenter(center, undefined, 'search');
}

export function mapBrandingToPendingCenter(
  branding: CenterBrandingResponseDto,
  joinCode?: string,
  joinSource?: JoinSource,
): PendingCenter {
  return mapCenterToPendingCenter({ ...branding, id: branding.centerId }, joinCode, joinSource);
}

/**
 * El contrato declara `city` como lista de textos en la respuesta por código y como texto en la
 * búsqueda: se acepta cualquiera de las dos formas hasta que el backend lo unifique.
 */
export function formatCenterCity(city: unknown): string | null {
  if (typeof city === 'string') return city.trim() === '' ? null : city.trim();
  if (Array.isArray(city)) {
    const cityNames = city.filter((name): name is string => typeof name === 'string');
    return cityNames.length === 0 ? null : cityNames.join(', ');
  }
  return null;
}
