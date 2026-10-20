/** Los módulos que el centro puede encender o apagar, en el orden en que se muestran. */
export const CENTER_MODULE_ENTRIES = [
  'content',
  'attendance',
  'passes',
  'waitlist',
  'rooms',
] as const;

export type CenterModuleEntry = (typeof CENTER_MODULE_ENTRIES)[number];
