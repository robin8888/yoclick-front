import Constants from 'expo-constants';

/** El id del proyecto de EAS, necesario para pedir el token de Expo; público (viaja en el bundle). */
export function readEasProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId;
}
