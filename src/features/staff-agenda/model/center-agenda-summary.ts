import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';

export interface AgendaStaffMember {
  membershipId: string;
  fullName: string;
}

export interface StaffAgendaColumn extends AgendaStaffMember {
  /** Citas del día sin las canceladas, por hora de inicio. */
  entries: AgendaResponseDtoEntriesItem[];
}

function isCancelled(entry: AgendaResponseDtoEntriesItem): boolean {
  return entry.booking.status === 'cancelled';
}

export function countScheduledEntries(entries: readonly AgendaResponseDtoEntriesItem[]): number {
  return entries.filter((entry) => !isCancelled(entry)).length;
}

export function countCancelledEntries(entries: readonly AgendaResponseDtoEntriesItem[]): number {
  return entries.filter(isCancelled).length;
}

/** Una columna por profesional del equipo, aunque hoy no tenga citas (prototipo `aagenda`). */
export function buildStaffAgendaColumns(
  entries: readonly AgendaResponseDtoEntriesItem[],
  teamStaff: readonly AgendaStaffMember[],
): StaffAgendaColumn[] {
  const scheduledEntries = entries.filter((entry) => !isCancelled(entry));
  const knownMembershipIds = new Set(teamStaff.map((member) => member.membershipId));
  const staffWithBookingsOnly = scheduledEntries
    .map((entry) => entry.booking.staff)
    .filter(({ membershipId }) => !knownMembershipIds.has(membershipId));
  const uniqueExtraStaff = [
    ...new Map(staffWithBookingsOnly.map((member) => [member.membershipId, member])).values(),
  ];

  return [...teamStaff, ...uniqueExtraStaff].map(({ membershipId, fullName }) => ({
    membershipId,
    fullName,
    entries: scheduledEntries
      .filter((entry) => entry.booking.staff.membershipId === membershipId)
      .sort((first, second) => first.booking.startsAt.localeCompare(second.booking.startsAt)),
  }));
}

/** «+4», «-2» o «0»: cuánto cambia un recuento respecto al del mismo día de la semana anterior. */
export function formatSignedDifference(currentCount: number, previousCount: number): string {
  const difference = currentCount - previousCount;
  return difference > 0 ? `+${String(difference)}` : String(difference);
}
