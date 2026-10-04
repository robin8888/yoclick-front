import * as SecureStore from 'expo-secure-store';

// Único acceso a SecureStore de la app (SEC-03). El refresh token rota en cada uso y vale 30 días:
// por eso solo se desbloquea con el dispositivo desbloqueado y no migra a otro dispositivo.
const REFRESH_TOKEN_KEY = 'yoclick.refresh-token';
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export interface SecureStorage {
  saveRefreshToken: (refreshToken: string) => Promise<void>;
  readRefreshToken: () => Promise<string | null>;
  clear: () => Promise<void>;
}

export const secureStorage: SecureStorage = {
  saveRefreshToken: (refreshToken) =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, SECURE_OPTIONS),
  readRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY, SECURE_OPTIONS),
  clear: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, SECURE_OPTIONS),
};
