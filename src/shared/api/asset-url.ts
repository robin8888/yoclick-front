import { getApiBaseUrl } from './api-config';

/**
 * Las respuestas de la API dan los ficheros (logo del centro) como ruta relativa
 * (`/v1/centers/{id}/logo?v=…`): aquí se completa con el origen de la API de este entorno.
 */
export function resolveApiAssetUrl(assetPath: string | null | undefined): string | null {
  if (assetPath === null || assetPath === undefined || assetPath === '') return null;
  if (!assetPath.startsWith('/')) return null;
  return `${getApiBaseUrl()}${assetPath}`;
}
