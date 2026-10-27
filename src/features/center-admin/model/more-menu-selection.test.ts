import type { CenterModuleEntry } from './center-module-entries';
import { MORE_MENU_GROUPS, type PlanFeatureName } from './more-menu';
import { selectMoreMenuGroups } from './more-menu-selection';

const ALL_ON: Record<CenterModuleEntry, boolean> = {
  content: true,
  attendance: true,
  passes: true,
  waitlist: true,
  rooms: true,
};

function listTextKeys(isAdvanced: boolean, modules = ALL_ON): string[] {
  return selectMoreMenuGroups(MORE_MENU_GROUPS, { modules, isAdvanced }).flatMap((group) =>
    group.entries.map((entry) => entry.textKey),
  );
}

describe('selectMoreMenuGroups', () => {
  it('keeps the everyday entries apart from the rarely used ones', () => {
    const everyday = listTextKeys(false);
    const advanced = listTextKeys(true);

    expect(everyday).toEqual(expect.arrayContaining(['inviteClients', 'services', 'reports']));
    expect(advanced).toEqual(
      expect.arrayContaining(['centerDetails', 'modules', 'security', 'privacy']),
    );
    expect(everyday.filter((textKey) => advanced.includes(textKey))).toEqual([]);
  });

  it('shows every entry of the menu either as everyday or as advanced', () => {
    const allTextKeys = MORE_MENU_GROUPS.flatMap((group) =>
      group.entries.map((entry) => entry.textKey),
    );

    const byName = (first: string, second: string): number => first.localeCompare(second);
    expect([...listTextKeys(false), ...listTextKeys(true)].sort(byName)).toEqual(
      [...allTextKeys].sort(byName),
    );
  });

  it('leaves out the entries of a module the center turned off', () => {
    const modules = { ...ALL_ON, passes: false, content: false };

    expect(listTextKeys(false, modules)).not.toContain('passes');
    expect(listTextKeys(false, modules)).not.toContain('routines');
  });

  it('does not show a block that ends up empty', () => {
    const groups = selectMoreMenuGroups(MORE_MENU_GROUPS, { modules: ALL_ON, isAdvanced: false });

    expect(groups.every((group) => group.entries.length > 0)).toBe(true);
  });

  it('hides the entries whose function the plan does not include', () => {
    const basicPlanKeys = [...listPlanTextKeys(false, []), ...listPlanTextKeys(true, [])];

    expect(basicPlanKeys).not.toEqual(expect.arrayContaining(['reports']));
    expect(basicPlanKeys).not.toContain('routines');
    expect(basicPlanKeys).not.toContain('importClients');
    expect(basicPlanKeys).toContain('services');
  });

  it('shows the entries of the features the plan includes', () => {
    const proKeys = [
      ...listPlanTextKeys(false, ['reports', 'routines', 'clientImport']),
      ...listPlanTextKeys(true, ['reports', 'routines', 'clientImport']),
    ];

    expect(proKeys).toEqual(expect.arrayContaining(['reports', 'routines', 'importClients']));
  });

  it('hides nothing while the plan is still loading', () => {
    expect([...listPlanTextKeys(false, undefined), ...listPlanTextKeys(true, undefined)]).toContain(
      'reports',
    );
  });
});

function listPlanTextKeys(
  isAdvanced: boolean,
  planFeatures: readonly PlanFeatureName[] | undefined,
): string[] {
  return selectMoreMenuGroups(MORE_MENU_GROUPS, {
    modules: ALL_ON,
    planFeatures,
    isAdvanced,
  }).flatMap((group) => group.entries.map((entry) => entry.textKey));
}
