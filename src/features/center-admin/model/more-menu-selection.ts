import type { CenterModuleEntry } from './center-module-entries';
import type { MoreMenuGroup } from './more-menu';

interface MoreMenuSelection {
  /** Los módulos que el centro usa; una entrada de un módulo apagado no sale. */
  modules: Readonly<Record<CenterModuleEntry, boolean>>;
  /** `false` = lo de cada día; `true` = lo que se toca pocas veces (ajustes, cuenta, equipo). */
  isAdvanced: boolean;
}

/** Las entradas que tocan en cada bloque del menú; un bloque sin entradas no se muestra. */
export function selectMoreMenuGroups(
  groups: readonly MoreMenuGroup[],
  { modules, isAdvanced }: MoreMenuSelection,
): MoreMenuGroup[] {
  return groups
    .map((group) => ({
      ...group,
      entries: group.entries.filter(
        (entry) =>
          (entry.isAdvanced === true) === isAdvanced &&
          (entry.requiredModule === undefined || modules[entry.requiredModule]),
      ),
    }))
    .filter((group) => group.entries.length > 0);
}
