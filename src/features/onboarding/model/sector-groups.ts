import type { SectorId } from '@/shared/i18n/sector-vocabulary';

export interface SectorGroup {
  readonly labelKey: 'sport' | 'school' | 'beauty' | 'other';
  readonly sectorIds: readonly SectorId[];
}

// Agrupación del prototipo (`SGROUPS`): ayuda a encontrar el tipo entre once opciones.
export const SECTOR_GROUPS: readonly SectorGroup[] = [
  { labelKey: 'sport', sectorIds: ['gym', 'estudio', 'readap', 'box', 'yoga'] },
  { labelKey: 'school', sectorIds: ['academia', 'baile', 'marciales', 'musica', 'cocina'] },
  { labelKey: 'beauty', sectorIds: ['peluqueria', 'estetica', 'fisioterapia', 'psicologia'] },
  { labelKey: 'other', sectorIds: ['otro'] },
];
