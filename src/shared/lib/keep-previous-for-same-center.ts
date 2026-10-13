import type { Query } from '@tanstack/react-query';

/**
 * `placeholderData` para listas por día: mientras llega el día nuevo se sigue viendo el anterior
 * (la pantalla no salta ni vuelve arriba). Solo del mismo centro: al cambiar de centro no se
 * enseña lo del anterior. La clave de la consulta empieza por la ruta con el id del centro.
 */
export function keepPreviousDataOfSameCenter<TData, TError>(
  currentPathKey: string,
): (
  previousData: TData | undefined,
  previousQuery: Query<TData, TError, TData> | undefined,
) => TData | undefined {
  return (previousData, previousQuery) =>
    previousQuery?.queryKey[0] === currentPathKey ? previousData : undefined;
}
