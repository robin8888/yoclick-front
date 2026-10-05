const CENTER_JOIN_LINK_BASE_URL = 'https://yoclick.app/j/';

/** Mismo formato que acepta el lector de QR y los enlaces universales. */
export function buildCenterJoinLink(joinCode: string): string {
  return `${CENTER_JOIN_LINK_BASE_URL}${encodeURIComponent(joinCode)}`;
}
