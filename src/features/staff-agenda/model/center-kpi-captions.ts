export const NO_VALUE_PLACEHOLDER = '—';

/** «78 %» o un guion si el centro no abre ese día o nadie atiende. */
export function formatOccupancyLabel(occupancyPercent: number | null | undefined): string {
  return occupancyPercent === null || occupancyPercent === undefined
    ? NO_VALUE_PLACEHOLDER
    : `${String(occupancyPercent)} %`;
}
