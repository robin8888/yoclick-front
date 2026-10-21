import { buildEmptyServiceForm, type ServiceFormValues } from './service-form';

const HALF_HOUR_MINUTES = 30;
const FORTY_FIVE_MINUTES = 45;
const FIFTY_MINUTES = 50;
const ONE_HOUR_MINUTES = 60;
const NINETY_MINUTES = 90;
const TWO_HOURS_MINUTES = 120;
const SHORT_BUFFER_MINUTES = 10;

/**
 * Un ejemplo de servicio para empezar. Su nombre y descripción están en `i18n`
 * (`centerAdmin.serviceTemplates.items.<id>`); el precio nunca se inventa: queda vacío.
 */
export interface ServiceTemplate {
  readonly id: ServiceTemplateId;
  readonly mode: ServiceFormValues['mode'];
  readonly durationMinutes: number;
  /** Minutos libres tras cada cita; sin él, ninguno. */
  readonly bufferMinutes?: number;
}

export const SERVICE_TEMPLATE_IDS = [
  'individualSession',
  'groupClass',
  'firstConsultation',
  'personalTraining',
  'fitnessClass',
  'initialAssessment',
  'smallGroupTraining',
  'rehabSession',
  'functionalAssessment',
  'followUpSession',
  'boxClass',
  'introClass',
  'yogaClass',
  'privateYogaClass',
  'workshop',
  'privateLesson',
  'groupLesson',
  'tutoring',
  'danceClass',
  'privateDanceClass',
  'martialArtsClass',
  'privateMartialArtsClass',
  'trialClass',
  'instrumentLesson',
  'musicTheoryClass',
  'singingLesson',
  'cookingWorkshop',
  'privateCookingClass',
  'tasting',
  'haircut',
  'hairColouring',
  'hairStyling',
  'manicure',
  'facialTreatment',
  'waxing',
  'physioSession',
  'physioFirstVisit',
  'therapeuticMassage',
  'therapySession',
  'firstTherapyVisit',
] as const;
export type ServiceTemplateId = (typeof SERVICE_TEMPLATE_IDS)[number];

/**
 * Los tipos de negocio con ejemplos. No son los sectores del centro: un negocio de citas (peluquería,
 * fisioterapia, psicología…) usa el mismo modelo aunque su sector sea «otro», y cualquier centro puede
 * mirar los ejemplos de otro tipo.
 */
export const TEMPLATE_PACK_IDS = [
  'gym',
  'estudio',
  'readap',
  'box',
  'yoga',
  'academia',
  'baile',
  'marciales',
  'musica',
  'cocina',
  'peluqueria',
  'estetica',
  'fisioterapia',
  'psicologia',
  'generic',
] as const;
export type TemplatePackId = (typeof TEMPLATE_PACK_IDS)[number];

const TEMPLATES_BY_PACK: Readonly<Record<TemplatePackId, readonly ServiceTemplate[]>> = {
  gym: [
    { id: 'personalTraining', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'fitnessClass', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'initialAssessment', mode: 'private', durationMinutes: HALF_HOUR_MINUTES },
  ],
  estudio: [
    { id: 'personalTraining', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'smallGroupTraining', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'initialAssessment', mode: 'private', durationMinutes: HALF_HOUR_MINUTES },
  ],
  readap: [
    {
      id: 'rehabSession',
      mode: 'private',
      durationMinutes: FORTY_FIVE_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
    {
      id: 'functionalAssessment',
      mode: 'private',
      durationMinutes: ONE_HOUR_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
    {
      id: 'followUpSession',
      mode: 'private',
      durationMinutes: HALF_HOUR_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
  ],
  box: [
    { id: 'boxClass', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'introClass', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'personalTraining', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
  ],
  yoga: [
    { id: 'yogaClass', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'privateYogaClass', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'workshop', mode: 'group', durationMinutes: NINETY_MINUTES },
  ],
  academia: [
    { id: 'privateLesson', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'groupLesson', mode: 'group', durationMinutes: NINETY_MINUTES },
    { id: 'tutoring', mode: 'private', durationMinutes: HALF_HOUR_MINUTES },
  ],
  baile: [
    { id: 'danceClass', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'privateDanceClass', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'workshop', mode: 'group', durationMinutes: NINETY_MINUTES },
  ],
  marciales: [
    { id: 'martialArtsClass', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'privateMartialArtsClass', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'trialClass', mode: 'private', durationMinutes: HALF_HOUR_MINUTES },
  ],
  musica: [
    { id: 'instrumentLesson', mode: 'private', durationMinutes: FORTY_FIVE_MINUTES },
    { id: 'musicTheoryClass', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'singingLesson', mode: 'private', durationMinutes: FORTY_FIVE_MINUTES },
  ],
  cocina: [
    { id: 'cookingWorkshop', mode: 'group', durationMinutes: TWO_HOURS_MINUTES },
    { id: 'privateCookingClass', mode: 'private', durationMinutes: NINETY_MINUTES },
    { id: 'tasting', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
  ],
  peluqueria: [
    {
      id: 'haircut',
      mode: 'private',
      durationMinutes: HALF_HOUR_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
    {
      id: 'hairColouring',
      mode: 'private',
      durationMinutes: NINETY_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
    {
      id: 'hairStyling',
      mode: 'private',
      durationMinutes: FORTY_FIVE_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
  ],
  estetica: [
    {
      id: 'manicure',
      mode: 'private',
      durationMinutes: FORTY_FIVE_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
    {
      id: 'facialTreatment',
      mode: 'private',
      durationMinutes: ONE_HOUR_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
    {
      id: 'waxing',
      mode: 'private',
      durationMinutes: HALF_HOUR_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
  ],
  fisioterapia: [
    {
      id: 'physioSession',
      mode: 'private',
      durationMinutes: FORTY_FIVE_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
    {
      id: 'physioFirstVisit',
      mode: 'private',
      durationMinutes: ONE_HOUR_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
    {
      id: 'therapeuticMassage',
      mode: 'private',
      durationMinutes: HALF_HOUR_MINUTES,
      bufferMinutes: SHORT_BUFFER_MINUTES,
    },
  ],
  psicologia: [
    { id: 'therapySession', mode: 'private', durationMinutes: FIFTY_MINUTES },
    { id: 'firstTherapyVisit', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'followUpSession', mode: 'private', durationMinutes: HALF_HOUR_MINUTES },
  ],
  generic: [
    { id: 'individualSession', mode: 'private', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'groupClass', mode: 'group', durationMinutes: ONE_HOUR_MINUTES },
    { id: 'firstConsultation', mode: 'private', durationMinutes: HALF_HOUR_MINUTES },
  ],
};

function isTemplatePackId(candidate: string): candidate is TemplatePackId {
  return (TEMPLATE_PACK_IDS as readonly string[]).includes(candidate);
}

/** El tipo de negocio que se enseña de primeras: el del sector si tiene ejemplos propios; si no, el genérico. */
export function getDefaultTemplatePackId(sectorId: string | null | undefined): TemplatePackId {
  if (sectorId === null || sectorId === undefined || sectorId === 'otro') return 'generic';
  return isTemplatePackId(sectorId) ? sectorId : 'generic';
}

export function getServiceTemplates(packId: TemplatePackId): readonly ServiceTemplate[] {
  return TEMPLATES_BY_PACK[packId];
}

/** El formulario con lo que trae el ejemplo; todo lo demás queda como en un servicio nuevo. */
export function buildFormFromTemplate(
  serviceTemplate: ServiceTemplate,
  texts: { name: string; description: string },
): ServiceFormValues {
  return {
    ...buildEmptyServiceForm(),
    name: texts.name,
    description: texts.description,
    durationMinutes: String(serviceTemplate.durationMinutes),
    bufferMinutes: String(serviceTemplate.bufferMinutes ?? 0),
    mode: serviceTemplate.mode,
  };
}
