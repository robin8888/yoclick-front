import type { Href } from 'expo-router';

import type { IconName } from '@/ui/atoms/Icon';

import { buildInvitePersonRoute } from './invite-person-route';

export type SetupGuideStepId =
  | 'centerDetails'
  | 'brand'
  | 'openingHours'
  | 'services'
  | 'rooms'
  | 'team'
  | 'passes'
  | 'content'
  | 'onlinePayments'
  | 'inviteClients'
  | 'privacy'
  | 'firstAppointment';

interface SetupGuideStepDefinition {
  id: SetupGuideStepId;
  iconName: IconName;
  route: Href;
}

export interface SetupGuideStep extends SetupGuideStepDefinition {
  /** Su número en la guía, desde 1 y sin saltos aunque falte algún paso del sector. */
  position: number;
}

export interface SetupGuideGroup {
  id: 'prepare' | 'teamAndPasses' | 'open';
  steps: readonly SetupGuideStep[];
}

const ROOMS_STEP: SetupGuideStepDefinition = {
  id: 'rooms',
  iconName: 'home',
  route: '/(admin)/(tabs)/management',
};

const PREPARE_STEPS: readonly SetupGuideStepDefinition[] = [
  { id: 'centerDetails', iconName: 'edit', route: '/(admin)/center' },
  { id: 'brand', iconName: 'palette', route: '/(admin)/(tabs)/brand' },
  { id: 'openingHours', iconName: 'clock', route: '/(admin)/hours' },
  { id: 'services', iconName: 'calendar', route: '/(admin)/services' },
];

const TEAM_AND_PASSES_STEPS: readonly SetupGuideStepDefinition[] = [
  { id: 'team', iconName: 'users', route: buildInvitePersonRoute('staff') },
  { id: 'passes', iconName: 'creditCard', route: '/(admin)/passes' },
  { id: 'content', iconName: 'upload', route: '/(admin)/(tabs)/content' },
  { id: 'onlinePayments', iconName: 'lock', route: '/(admin)/passes' },
];

const OPEN_STEPS: readonly SetupGuideStepDefinition[] = [
  { id: 'inviteClients', iconName: 'qrCode', route: '/(admin)/invite-clients' },
  { id: 'privacy', iconName: 'file', route: '/(admin)/privacy' },
  { id: 'firstAppointment', iconName: 'checkCircle', route: '/(admin)/new-appointment' },
];

/**
 * El orden en que un centro queda listo para funcionar: primero lo que ve cualquiera, luego equipo
 * y bonos y, al final, abrir las puertas. «Salas» solo existe en los sectores que las tienen.
 */
export function buildSetupGuideGroups(options: {
  canManageSpaces: boolean;
}): readonly SetupGuideGroup[] {
  const rooms = options.canManageSpaces ? [ROOMS_STEP] : [];
  const definitions: readonly {
    id: SetupGuideGroup['id'];
    steps: readonly SetupGuideStepDefinition[];
  }[] = [
    { id: 'prepare', steps: [...PREPARE_STEPS, ...rooms] },
    { id: 'teamAndPasses', steps: TEAM_AND_PASSES_STEPS },
    { id: 'open', steps: OPEN_STEPS },
  ];

  let position = 0;
  return definitions.map((group) => ({
    id: group.id,
    steps: group.steps.map((step) => {
      position += 1;
      return { ...step, position };
    }),
  }));
}
