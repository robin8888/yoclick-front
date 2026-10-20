import type { Href } from 'expo-router';

import type { IconName } from '@/ui/atoms/Icon';

import type { CenterModuleEntry } from './center-module-entries';
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
  /** Si el centro apaga este módulo, el paso no sale. */
  requiredModule?: CenterModuleEntry;
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
  requiredModule: 'rooms',
};

const CLASSES_STEP: SetupGuideStepDefinition = {
  id: 'classes',
  iconName: 'calendar',
  route: '/(admin)/schedules/new',
  requiredModule: 'rooms',
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
  { id: 'passes', iconName: 'creditCard', route: '/(admin)/passes', requiredModule: 'passes' },
  {
    id: 'content',
    iconName: 'upload',
    route: '/(admin)/(tabs)/content',
    requiredModule: 'content',
  },
  { id: 'onlinePayments', iconName: 'lock', route: '/(admin)/passes', requiredModule: 'passes' },
];

const OPEN_STEPS: readonly SetupGuideStepDefinition[] = [
  { id: 'inviteClients', iconName: 'qrCode', route: '/(admin)/invite-clients' },
  { id: 'privacy', iconName: 'file', route: '/(admin)/privacy' },
  { id: 'firstAppointment', iconName: 'checkCircle', route: '/(admin)/new-appointment' },
];

/** Los módulos del centro; un módulo que no está en la lista se da por encendido. */
type SetupGuideModules = Readonly<Partial<Record<CenterModuleEntry, boolean>>>;

/**
 * El orden en que un centro queda listo para funcionar: primero lo que ve cualquiera, luego equipo
 * y bonos y, al final, abrir las puertas. «Salas» y «Clases» solo existen en los sectores que
 * tienen salas (la clase se crea sobre una sala) y los pasos de un módulo apagado no salen.
 */
export function buildSetupGuideGroups(options: {
  canManageSpaces: boolean;
  modules?: SetupGuideModules;
}): readonly SetupGuideGroup[] {
  const { canManageSpaces, modules = {} } = options;
  const isOn = (step: SetupGuideStepDefinition): boolean =>
    step.requiredModule === undefined || modules[step.requiredModule] !== false;
  const rooms = canManageSpaces ? [ROOMS_STEP] : [];
  const classes = canManageSpaces ? [CLASSES_STEP] : [];
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
    steps: group.steps.filter(isOn).map((step) => {
      position += 1;
      return { ...step, position };
    }),
  }));
}
