/** Añade o quita un servicio de la selección, sin repetirlo. */
export function toggleServiceSelection(
  selectedServiceIds: readonly string[],
  serviceId: string,
): string[] {
  return selectedServiceIds.includes(serviceId)
    ? selectedServiceIds.filter((selectedId) => selectedId !== serviceId)
    : [...selectedServiceIds, serviceId];
}

/** Las dos listas tienen los mismos servicios, da igual el orden. */
export function haveSameServices(
  firstServiceIds: readonly string[],
  secondServiceIds: readonly string[],
): boolean {
  return (
    firstServiceIds.length === secondServiceIds.length &&
    firstServiceIds.every((serviceId) => secondServiceIds.includes(serviceId))
  );
}
