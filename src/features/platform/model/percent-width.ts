const PERCENT = 100;

/** Una fracción de 0 a 1 como ancho porcentual de un estilo (`0.25` → `'25%'`). */
export function toPercentWidth(ratio: number): `${number}%` {
  return `${String(ratio * PERCENT)}%` as `${number}%`;
}
