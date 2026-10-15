import { i18n } from '@/shared/i18n';

/** «Da la clase Ana», o «Sin profesor (alquiler)» cuando la sala se cede sin nadie que la dé. */
export function describeTeacherLine(teacher: { fullName: string } | null): string {
  if (teacher === null) return i18n.t('staffAgenda.rooms.noTeacher');
  return i18n.t('staffAgenda.rooms.teacherLine', { teacher: teacher.fullName });
}
