const STRENGTH = ['Fuerza', 'Movilidad', 'Espalda', 'Rodilla', 'Cardio'];
const MIND_BODY = ['Respiración', 'Flexibilidad', 'Core', 'Relajación', 'Espalda'];

/** Las especialidades que se ofrecen al escribir el perfil, según el tipo de centro (prototipo `iprof`). */
const SPECIALTIES_BY_SECTOR: Readonly<Record<string, readonly string[]>> = {
  gym: STRENGTH,
  box: STRENGTH,
  readap: STRENGTH,
  estudio: MIND_BODY,
  yoga: MIND_BODY,
  academia: ['Inglés', 'Matemáticas', 'Lengua', 'Exámenes', 'Oposiciones'],
  baile: ['Salsa', 'Bachata', 'Flamenco', 'Técnica', 'Coreografías'],
  marciales: ['Katas', 'Técnica', 'Combate', 'Defensa personal', 'Preparación física'],
  musica: ['Guitarra', 'Piano', 'Canto', 'Lenguaje musical', 'Batería'],
  cocina: ['Técnicas', 'Panadería', 'Repostería', 'Cocina del mundo', 'Menús'],
};

const GENERAL_SPECIALTIES: readonly string[] = ['General', 'Guías', 'Vídeos'];

export const LANGUAGE_OPTIONS: readonly string[] = [
  'Castellano',
  'Inglés',
  'Catalán',
  'Euskera',
  'Gallego',
  'Francés',
  'Alemán',
  'Portugués',
];

export function getSpecialtyOptions(sectorId: string | undefined): readonly string[] {
  return (
    (sectorId !== undefined ? SPECIALTIES_BY_SECTOR[sectorId] : undefined) ?? GENERAL_SPECIALTIES
  );
}

/** Lo ya elegido que no está en las opciones (otro tipo de centro, texto antiguo) se sigue pudiendo quitar. */
export function mergeWithChosen(options: readonly string[], chosen: readonly string[]): string[] {
  const extra = chosen.filter((item) => !options.includes(item));
  return [...options, ...extra];
}
