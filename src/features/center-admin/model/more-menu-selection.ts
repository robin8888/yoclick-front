import type { CenterModuleEntry } from './center-module-entries';
import type { MoreMenuEntry, MoreMenuGroup, PlanFeatureName } from './more-menu';

interface MoreMenuSelection {
  /** Los módulos que el centro usa; una entrada de un módulo apagado no sale. */
  modules: Readonly<Record<CenterModuleEntry, boolean>>;
  /** Lo que da el plan del centro; `undefined` mientras se carga (no se esconde nada hasta saberlo). */
  planFeatures?: readonly PlanFeatureName[] | undefined;
  /** `false` = lo de cada día; `true` = lo que se toca pocas veces (ajustes, cuenta, equipo). */
  isAdvanced: boolean;
}

function isIncludedInPlan(
  entry: MoreMenuEntry,
  planFeatures: readonly PlanFeatureName[] | undefined,
): boolean {
  if (entry.requiredPlanFeature === undefined || planFeatures === undefined) return true;
  return planFeatures.includes(entry.requiredPlanFeature);
}

/** Las entradas que tocan en cada bloque del menú; un bloque sin entradas no se muestra. */
export function selectMoreMenuGroups(
  groups: readonly MoreMenuGroup[],
  { modules, planFeatures, isAdvanced }: MoreMenuSelection,
): MoreMenuGroup[] {
  const isEntryAvailable = (entry: MoreMenuEntry): boolean =>
    (entry.isAdvanced === true) === isAdvanced &&
    (entry.requiredModule === undefined || modules[entry.requiredModule]) &&
    isIncludedInPlan(entry, planFeatures);
  return groups
    .map((group) => ({ ...group, entries: group.entries.filter(isEntryAvailable) }))
    .filter((group) => group.entries.length > 0);
}
