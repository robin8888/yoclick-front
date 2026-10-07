/**
 * El CDN de vídeo rechaza (403) las peticiones sin cabecera `Referer` y los reproductores nativos del
 * móvil no la mandan: se envía una fija, la de la web de Yoclick, tanto al vídeo como a la miniatura.
 */
export const VIDEO_REQUEST_HEADERS = { Referer: 'https://yoclick.app/' } as const;

export function buildVideoSource(url: string): { uri: string; headers: Record<string, string> } {
  return { uri: url, headers: { ...VIDEO_REQUEST_HEADERS } };
}
