import * as SecureStore from 'expo-secure-store';

import { secureStorage } from './secure';

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve('stored-refresh-token')),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const expectedOptions = { keychainAccessible: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY' };

describe('secureStorage', () => {
  it('saves the refresh token only for this unlocked device (SEC-03)', async () => {
    await secureStorage.saveRefreshToken('new-refresh-token');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      expect.any(String),
      'new-refresh-token',
      expectedOptions,
    );
  });

  it('reads the refresh token it saved', async () => {
    await expect(secureStorage.readRefreshToken()).resolves.toBe('stored-refresh-token');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(expect.any(String), expectedOptions);
  });

  it('deletes the refresh token on clear', async () => {
    await secureStorage.clear();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(expect.any(String), expectedOptions);
  });
});
