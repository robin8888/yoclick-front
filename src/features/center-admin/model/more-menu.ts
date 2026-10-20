import type { Href } from 'expo-router';

import type { IconName } from '@/ui/atoms/Icon';

import type { CenterModuleEntry } from './center-module-entries';
import { buildInvitePersonRoute } from './invite-person-route';

export type MoreMenuTextKey =
  | 'messages'
  | 'centerDetails'
  | 'modules'
  | 'brand'
  | 'services'
  | 'inviteClients'
  | 'importClients'
  | 'routines'
  | 'reports'
  | 'passes'
  | 'subscription'
  | 'inviteStudent'
  | 'inviteGuardian'
  | 'inviteInstructor'
  | 'myProfile'
  | 'teamProfiles'
  | 'records'
  | 'security'
  | 'privacy';

export interface MoreMenuEntry {
  textKey: MoreMenuTextKey;
  /** Si el centro apaga este módulo, la entrada no sale. */
  requiredModule?: CenterModuleEntry;
  /** Se toca pocas veces (ajustes, cuenta, altas): va plegada bajo «Más ajustes». */
  isAdvanced?: true;
  route: Href;
  iconName: IconName;
}

export interface MoreMenuGroup {
  id: 'center' | 'money' | 'team' | 'account';
  entries: readonly MoreMenuEntry[];
}

/**
 * Prototipo `amore`: los accesos agrupados («Tu centro», «Equipo», «Cuenta»). Solo salen las
 * pantallas que existen en la app; rutinas, campañas, tarifas, informes o suscripción llegan en
 * otras fases.
 */
export const MORE_MENU_GROUPS: readonly MoreMenuGroup[] = [
  {
    id: 'center',
    entries: [
      { textKey: 'messages', route: '/(admin)/messages', iconName: 'messageCircle' },
      { textKey: 'centerDetails', route: '/(admin)/center', iconName: 'edit', isAdvanced: true },
      { textKey: 'modules', route: '/(admin)/modules', iconName: 'settings', isAdvanced: true },
      { textKey: 'inviteClients', route: '/(admin)/invite-clients', iconName: 'qrCode' },
      {
        textKey: 'inviteStudent',
        route: buildInvitePersonRoute('client'),
        iconName: 'mail',
        isAdvanced: true,
      },
      {
        textKey: 'inviteGuardian',
        route: buildInvitePersonRoute('guardian'),
        iconName: 'users',
        isAdvanced: true,
      },
      {
        textKey: 'routines',
        route: '/(admin)/routines',
        iconName: 'play',
        requiredModule: 'content',
      },
      {
        textKey: 'importClients',
        route: '/(admin)/clients/import',
        iconName: 'file',
        isAdvanced: true,
      },
      { textKey: 'brand', route: '/(admin)/(tabs)/brand', iconName: 'palette' },
      { textKey: 'services', route: '/(admin)/services', iconName: 'calendar' },
    ],
  },
  {
    id: 'money',
    entries: [
      {
        textKey: 'passes',
        route: '/(admin)/passes',
        iconName: 'creditCard',
        requiredModule: 'passes',
      },
      { textKey: 'reports', route: '/(admin)/reports', iconName: 'file' },
      {
        textKey: 'subscription',
        route: '/(admin)/subscription',
        iconName: 'settings',
        isAdvanced: true,
      },
    ],
  },
  {
    id: 'team',
    entries: [
      {
        textKey: 'inviteInstructor',
        route: buildInvitePersonRoute('staff'),
        iconName: 'users',
        isAdvanced: true,
      },
      {
        textKey: 'myProfile',
        route: '/(admin)/public-profile',
        iconName: 'user',
        isAdvanced: true,
      },
      {
        textKey: 'teamProfiles',
        route: '/(admin)/team/profiles',
        iconName: 'play',
        isAdvanced: true,
      },
      { textKey: 'records', route: '/(admin)/(tabs)/records', iconName: 'clock' },
    ],
  },
  {
    id: 'account',
    entries: [
      { textKey: 'security', route: '/(admin)/security', iconName: 'lock', isAdvanced: true },
      { textKey: 'privacy', route: '/(admin)/privacy', iconName: 'file', isAdvanced: true },
    ],
  },
];
