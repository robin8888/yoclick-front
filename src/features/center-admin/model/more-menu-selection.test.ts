import type { CenterModuleEntry } from './center-module-entries';
import { MORE_MENU_GROUPS } from './more-menu';
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
});
