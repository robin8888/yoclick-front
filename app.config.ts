import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { ExpoConfig } from 'expo/config';

import { buildExpoConfig } from './config/app-config/build-expo-config.ts';
import {
  AppConfigError,
  parseBuildEnvironment,
} from './config/app-config/parse-build-environment.ts';

// Falla en build y no en runtime si a un centro Premium le faltan los iconos.
function assertAssetsExist(config: ExpoConfig): void {
  const assetPaths = [config.icon, config.android?.adaptiveIcon?.foregroundImage];
  for (const assetPath of assetPaths) {
    if (assetPath !== undefined && !existsSync(resolve(__dirname, assetPath))) {
      throw new AppConfigError(`Missing asset ${assetPath}.`);
    }
  }
}

export default function createExpoConfig(): ExpoConfig {
  const buildEnvironment = parseBuildEnvironment(process.env);
  const config = buildExpoConfig(buildEnvironment);
  assertAssetsExist(config);
  return config;
}
