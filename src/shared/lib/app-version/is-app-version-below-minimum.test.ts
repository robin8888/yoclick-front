import { isAppVersionBelowMinimum } from './is-app-version-below-minimum';

describe('isAppVersionBelowMinimum', () => {
  it.each([
    ['1.0.0', '1.0.1', true],
    ['1.0.0', '1.1.0', true],
    ['1.9.9', '2.0.0', true],
    ['1.2.3', '1.2.3', false],
    ['1.2.4', '1.2.3', false],
    ['2.0.0', '1.99.99', false],
    ['1.10.0', '1.9.0', false],
    ['1.9.0', '1.10.0', true],
    [' 1.0.0 ', '1.0.1', true],
  ])(
    'installed %s vs minimum %s → update required: %s',
    (installedVersion, minimumVersion, isUpdateRequired) => {
      expect(isAppVersionBelowMinimum(installedVersion, minimumVersion)).toBe(isUpdateRequired);
    },
  );

  it.each([
    ['1.0', '1.0.1'],
    ['1.0.0', 'latest'],
    ['', '1.0.0'],
    ['1.0.0', ''],
    ['1.0.0-beta.1', '1.0.1'],
  ])('never blocks when a version is unreadable (%j vs %j)', (installedVersion, minimumVersion) => {
    expect(isAppVersionBelowMinimum(installedVersion, minimumVersion)).toBe(false);
  });
});
