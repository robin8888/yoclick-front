import { Platform } from 'react-native';

/** El nombre con el que el dispositivo aparece en «Sesiones abiertas»; no lleva datos personales. */
export function getDeviceName(): string {
  if (Platform.OS === 'ios') return 'iPhone · app';
  if (Platform.OS === 'android') return 'Android · app';
  return 'Navegador';
}
