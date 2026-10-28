export type ChatRole = 'owner' | 'admin' | 'staff' | 'client';

/**
 * Solo se bloquea entre alumno y profesor, igual que la API: la administración actúa en nombre del centro
 * y sus avisos tienen que llegar, así que ni bloquea ni se la puede bloquear (se la denuncia).
 */
export function canBlockPerson(input: {
  myRole: ChatRole | null;
  counterpartRole: ChatRole;
}): boolean {
  const { myRole, counterpartRole } = input;
  if (myRole === 'client') return counterpartRole === 'staff';
  if (myRole === 'staff') return counterpartRole === 'client';
  return false;
}
