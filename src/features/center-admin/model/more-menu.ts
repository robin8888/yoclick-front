import type { Href } from 'expo-router';

import type { IconName } from '@/ui/atoms/Icon';

import { buildInvitePersonRoute } from './invite-person-route';

export type MoreMenuTextKey =
  | 'centerDetails'
  | 'brand'
  | 'services'
  | 'inviteClients'
  | 'importClients'
  | 'routines'
  | 'reports'
  | 'subscription'
  | 'inviteStudent'
  | 'inviteInstructor'
  | 'myProfile'
  | 'teamProfiles'
  | 'records'
  | 'security'
  | 'privacy';

export interface MoreMenuEntry {
  textKey: MoreMenuTextKey;
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
      { textKey: 'centerDetails', route: '/(admin)/center', iconName: 'edit' },
      { textKey: 'inviteClients', route: '/(admin)/invite-clients', iconName: 'qrCode' },
      { textKey: 'inviteStudent', route: buildInvitePersonRoute('client'), iconName: 'mail' },
      { textKey: 'routines', route: '/(admin)/routines', iconName: 'play' },
      { textKey: 'importClients', route: '/(admin)/clients/import', iconName: 'file' },
      { textKey: 'brand', route: '/(admin)/(tabs)/brand', iconName: 'palette' },
      { textKey: 'services', route: '/(admin)/services', iconName: 'calendar' },
    ],
  },
  {
    id: 'money',
    entries: [
      { textKey: 'reports', route: '/(admin)/reports', iconName: 'creditCard' },
      { textKey: 'subscription', route: '/(admin)/subscription', iconName: 'settings' },
    ],
  },
  {
    id: 'team',
    entries: [
      { textKey: 'inviteInstructor', route: buildInvitePersonRoute('staff'), iconName: 'users' },
      { textKey: 'myProfile', route: '/(admin)/public-profile', iconName: 'user' },
      { textKey: 'teamProfiles', route: '/(admin)/team/profiles', iconName: 'play' },
      { textKey: 'records', route: '/(admin)/(tabs)/records', iconName: 'clock' },
    ],
  },
  {
    id: 'account',
    entries: [
      { textKey: 'security', route: '/(admin)/security', iconName: 'lock' },
      { textKey: 'privacy', route: '/(admin)/privacy', iconName: 'file' },
    ],
  },
];
