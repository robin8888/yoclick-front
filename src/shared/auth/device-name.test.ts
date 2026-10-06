import { Platform } from 'react-native';

import { getDeviceName } from './device-name';

describe('getDeviceName', () => {
  const originalOs = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOs;
  });

  it.each([
    ['ios', 'iPhone · app'],
    ['android', 'Android · app'],
    ['web', 'Navegador'],
  ] as const)('names a %s device', (os, expectedName) => {
    Platform.OS = os;

    expect(getDeviceName()).toBe(expectedName);
  });
});
