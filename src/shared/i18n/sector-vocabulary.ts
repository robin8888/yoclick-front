// Vocabulario por tipo de centro (docs/spec/00-producto.md). Las pantallas compartidas nunca
// escriben «gimnasio», «instructor» o «entrenar»: piden la palabra aquí según el sector del centro.

export const SECTOR_IDS = [
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
  'otro',
] as const;

export type SectorId = (typeof SECTOR_IDS)[number];

export interface WordForms {
  readonly singular: string;
  readonly plural: string;
}

export interface SectorVocabulary {
  readonly sectorId: SectorId;
  /** Persona que da las sesiones: instructor, profesor, coach… */
  readonly staff: WordForms;
  /** Persona que reserva: cliente o alumno. */
  readonly client: WordForms;
  /** Lo que se reserva: sesión o clase. */
  readonly session: WordForms;
  /** Rótulo de la pestaña de contenido: Entrenar, Practicar… */
  readonly contentTabLabel: string;
  /** Lo que el equipo prepara para practicar: rutina, secuencia, tarea… */
  readonly routine: WordForms;
  readonly levels: readonly [string, string, string];
}

const FITNESS_LEVELS = ['Inicio', 'Base', 'Avanzado'] as const;
const PRACTICE_LEVELS = ['Iniciación', 'Intermedio', 'Avanzado'] as const;
const BASIC_LEVELS = ['Básico', 'Intermedio', 'Avanzado'] as const;

const INSTRUCTOR: WordForms = { singular: 'instructor', plural: 'instructores' };
const PROFESSIONAL: WordForms = { singular: 'profesional', plural: 'profesionales' };
const TEACHER: WordForms = { singular: 'profesor', plural: 'profesores' };
const CLIENT: WordForms = { singular: 'cliente', plural: 'clientes' };
const STUDENT: WordForms = { singular: 'alumno', plural: 'alumnos' };
const SESSION: WordForms = { singular: 'sesión', plural: 'sesiones' };
const CLASS: WordForms = { singular: 'clase', plural: 'clases' };
const ROUTINE: WordForms = { singular: 'rutina', plural: 'rutinas' };
const PRACTICE: WordForms = { singular: 'práctica', plural: 'prácticas' };
const SEQUENCE: WordForms = { singular: 'secuencia', plural: 'secuencias' };
const TASK: WordForms = { singular: 'tarea', plural: 'tareas' };
const PLAN: WordForms = { singular: 'plan', plural: 'planes' };

export const SECTOR_VOCABULARY: Readonly<Record<SectorId, SectorVocabulary>> = {
  gym: {
    sectorId: 'gym',
    staff: INSTRUCTOR,
    client: CLIENT,
    session: SESSION,
    contentTabLabel: 'Entrenar',
    routine: ROUTINE,
    levels: FITNESS_LEVELS,
  },
  estudio: {
    sectorId: 'estudio',
    staff: INSTRUCTOR,
    client: CLIENT,
    session: SESSION,
    contentTabLabel: 'Entrenar',
    routine: ROUTINE,
    levels: FITNESS_LEVELS,
  },
  readap: {
    sectorId: 'readap',
    staff: PROFESSIONAL,
    client: CLIENT,
    session: SESSION,
    contentTabLabel: 'Entrenar',
    routine: ROUTINE,
    levels: FITNESS_LEVELS,
  },
  box: {
    sectorId: 'box',
    staff: { singular: 'coach', plural: 'coaches' },
    client: CLIENT,
    session: SESSION,
    contentTabLabel: 'Entrenar',
    routine: ROUTINE,
    levels: FITNESS_LEVELS,
  },
  yoga: {
    sectorId: 'yoga',
    staff: TEACHER,
    client: STUDENT,
    session: CLASS,
    contentTabLabel: 'Practicar',
    routine: SEQUENCE,
    levels: PRACTICE_LEVELS,
  },
  academia: {
    sectorId: 'academia',
    staff: TEACHER,
    client: STUDENT,
    session: CLASS,
    contentTabLabel: 'Estudiar',
    routine: TASK,
    levels: BASIC_LEVELS,
  },
  baile: {
    sectorId: 'baile',
    staff: TEACHER,
    client: STUDENT,
    session: CLASS,
    contentTabLabel: 'Practicar',
    routine: PRACTICE,
    levels: PRACTICE_LEVELS,
  },
  marciales: {
    sectorId: 'marciales',
    staff: { singular: 'maestro', plural: 'maestros' },
    client: STUDENT,
    session: CLASS,
    contentTabLabel: 'Practicar',
    routine: PLAN,
    levels: ['Principiante', 'Intermedio', 'Avanzado'],
  },
  musica: {
    sectorId: 'musica',
    staff: TEACHER,
    client: STUDENT,
    session: CLASS,
    contentTabLabel: 'Practicar',
    routine: PRACTICE,
    levels: PRACTICE_LEVELS,
  },
  cocina: {
    sectorId: 'cocina',
    staff: { singular: 'chef', plural: 'chefs' },
    client: STUDENT,
    session: CLASS,
    contentTabLabel: 'Aprender',
    routine: PRACTICE,
    levels: PRACTICE_LEVELS,
  },
  otro: {
    sectorId: 'otro',
    staff: PROFESSIONAL,
    client: CLIENT,
    session: CLASS,
    contentTabLabel: 'Contenido',
    routine: PRACTICE,
    levels: BASIC_LEVELS,
  },
};

const FALLBACK_SECTOR_ID: SectorId = 'otro';

function isSectorId(candidate: string): candidate is SectorId {
  return (SECTOR_IDS as readonly string[]).includes(candidate);
}

/** Un sector desconocido (la API puede añadir uno nuevo antes que la app) usa el neutro `otro`. */
export function getSectorVocabulary(sectorId: string | null | undefined): SectorVocabulary {
  if (sectorId === null || sectorId === undefined || !isSectorId(sectorId)) {
    return SECTOR_VOCABULARY[FALLBACK_SECTOR_ID];
  }
  return SECTOR_VOCABULARY[sectorId];
}

/** Para frases que empiezan por la palabra: «instructor» → «Instructor». */
export function capitalizeFirstLetter(word: string): string {
  return word.charAt(0).toLocaleUpperCase('es-ES') + word.slice(1);
}
