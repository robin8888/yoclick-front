export interface MapPoint {
  latitude: number;
  longitude: number;
}

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const COORDINATE = String.raw`(-?\d{1,3}(?:\.\d+)?)`;
const PAIR = `${COORDINATE}\\s*,\\s*${COORDINATE}`;

// De más a menos específico: WhatsApp y Google Maps comparten «?q=lat,lng», Apple Maps «ll=lat,lng»,
// una ficha de Google lleva «@lat,lng» o «!3dlat!4dlng», y Android «geo:lat,lng».
const LINK_PATTERNS = [
  new RegExp(String.raw`geo:${PAIR}`),
  new RegExp(String.raw`[?&](?:q|ll|query|destination|daddr|center|sll)=${PAIR}`),
  new RegExp(String.raw`!3d${COORDINATE}!4d${COORDINATE}`),
  new RegExp(String.raw`@${PAIR}`),
  new RegExp(String.raw`^\s*${PAIR}\s*$`),
] as const;

function isValidPoint(point: MapPoint): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= MAX_LATITUDE &&
    Math.abs(point.longitude) <= MAX_LONGITUDE
  );
}

function safelyDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    // Un «%» suelto no es un enlace codificado: se lee tal cual.
    return text;
  }
}

/**
 * El punto del mapa que lleva un enlace de ubicación (el que comparte WhatsApp, Google Maps, Apple
 * Maps o un «geo:») o unas coordenadas escritas («40.4153, -3.6844»). `null` si no se encuentra:
 * los enlaces cortos de Google (maps.app.goo.gl) no traen el punto, solo redirigen a él.
 */
export function parseLocationLink(text: string): MapPoint | null {
  const decodedText = safelyDecode(text.trim());
  for (const pattern of LINK_PATTERNS) {
    const match = pattern.exec(decodedText);
    if (match === null) continue;
    const point = { latitude: Number(match[1]), longitude: Number(match[2]) };
    if (isValidPoint(point)) return point;
  }
  return null;
}
