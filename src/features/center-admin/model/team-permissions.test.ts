import {
  buildPermissionChange,
  pickGrantedPermissions,
  togglePermission,
} from './team-permissions';

describe('pickGrantedPermissions', () => {
  it('keeps only the permissions the screen manages', () => {
    expect(pickGrantedPermissions(['health:read', 'reports:view', 'clients:manage'])).toEqual([
      'reports:view',
      'clients:manage',
    ]);
  });
});

describe('togglePermission', () => {
  it.each([
    { caseName: 'turning one on', granted: [], isOn: true, expected: ['reports:view'] },
    {
      caseName: 'turning the same one on twice',
      granted: ['reports:view'],
      isOn: true,
      expected: ['reports:view'],
    },
    {
      caseName: 'turning one off',
      granted: ['reports:view', 'clients:manage'],
      isOn: false,
      expected: ['clients:manage'],
    },
  ] as const)('$caseName', ({ granted, isOn, expected }) => {
    expect(togglePermission(granted, 'reports:view', isOn)).toEqual(expected);
  });
});

describe('buildPermissionChange', () => {
  it.each([
    {
      caseName: 'nothing changes',
      stored: ['reports:view'],
      granted: ['reports:view'],
      expected: null,
    },
    {
      caseName: 'the order differs',
      stored: ['reports:view', 'clients:manage'],
      granted: ['clients:manage', 'reports:view'],
      expected: null,
    },
    {
      caseName: 'one is added',
      stored: [],
      granted: ['clients:manage'],
      expected: ['clients:manage'],
    },
    { caseName: 'all are removed', stored: ['reports:view'], granted: [], expected: [] },
    {
      caseName: 'a permission the screen does not manage is kept',
      stored: ['health:read', 'reports:view'],
      granted: ['services:manage'],
      expected: ['health:read', 'services:manage'],
    },
  ] as const)('$caseName', ({ stored, granted, expected }) => {
    expect(buildPermissionChange(stored, granted)).toEqual(expected);
  });
});
