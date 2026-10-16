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
  | 'classes'
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

const CLASSES_STEP: SetupGuideStepDefinition = {
  id: 'classes',
  iconName: 'calendar',
  route: '/(admin)/schedules/new',
};

const PREPARE_STEPS: readonly SetupGuideStepDefinition[] = [
  { id: 'centerDetails', iconName: 'edit', route: '/(admin)/center' },
  { id: 'brand', iconName: 'palette', route: '/(admin)/(tabs)/brand' },
  { id: 'openingHours', iconName: 'clock', route: '/(admin)/hours' },
  {
    id: 'services',
    iconName: 'file',
    route: { pathname: '/(admin)/services/[serviceId]', params: { serviceId: 'new' } },
  },
];

const TEAM_STEP: SetupGuideStepDefinition = {
  id: 'team',
  iconName: 'users',
  route: buildInvitePersonRoute('staff'),
};

const PASSES_AND_CONTENT_STEPS: readonly SetupGuideStepDefinition[] = [
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
 * y bonos y, al final, abrir las puertas. «Salas» y «Clases» solo existen en los sectores que
 * tienen salas: la clase se crea sobre una sala.
 */
export function buildSetupGuideGroups(options: {
  canManageSpaces: boolean;
}): readonly SetupGuideGroup[] {
  const rooms = options.canManageSpaces ? [ROOMS_STEP] : [];
  const classes = options.canManageSpaces ? [CLASSES_STEP] : [];
  const definitions: readonly {
    id: SetupGuideGroup['id'];
    steps: readonly SetupGuideStepDefinition[];
  }[] = [
    { id: 'prepare', steps: [...PREPARE_STEPS, ...rooms] },
    { id: 'teamAndPasses', steps: [TEAM_STEP, ...classes, ...PASSES_AND_CONTENT_STEPS] },
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
