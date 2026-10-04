import { isJoinCodeWellFormed, normalizeJoinCode } from './join-code';

const JOIN_LINK_HOST = 'yoclick.app';
const JOIN_LINK_PATH_PATTERN = /^\/j\/([^/]+)$/;

function isPlainJoinLink(parsedUrl: URL): boolean {
  return (
    parsedUrl.protocol === 'https:' &&
    parsedUrl.hostname === JOIN_LINK_HOST &&
    parsedUrl.username === '' &&
    parsedUrl.password === '' &&
    parsedUrl.search === '' &&
    parsedUrl.hash === ''
  );
}

function parseUrlOrNull(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

/**
 * Lee el contenido de un QR del centro. Solo admite el enlace universal
 * `https://yoclick.app/j/{código}`: el contenido de un QR es entrada no confiable (SEC-M4) y
 * cualquier otra cosa se descarta sin intentar interpretarla.
 */
export function parseJoinQrContent(rawQrContent: string): string | null {
  const parsedUrl = parseUrlOrNull(rawQrContent.trim());
  if (parsedUrl === null || !isPlainJoinLink(parsedUrl)) return null;

  const rawJoinCode = JOIN_LINK_PATH_PATTERN.exec(parsedUrl.pathname)?.[1];
  if (rawJoinCode === undefined || !isJoinCodeWellFormed(rawJoinCode)) return null;
  return normalizeJoinCode(rawJoinCode);
}
