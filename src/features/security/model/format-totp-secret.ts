const GROUP_LENGTH = 4;

/** `JBSWY3DPEHPK3PXP` → `JBSW Y3DP EHPK 3PXP`: más fácil de leer y de teclear. */
export function formatTotpSecret(secret: string): string {
  const compactSecret = secret.replace(/\s/g, '').toUpperCase();
  const groupCount = Math.ceil(compactSecret.length / GROUP_LENGTH);
  return Array.from({ length: groupCount }, (_unused, groupIndex) =>
    compactSecret.slice(groupIndex * GROUP_LENGTH, (groupIndex + 1) * GROUP_LENGTH),
  ).join(' ');
}
