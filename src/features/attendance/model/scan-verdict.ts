import type { CheckInResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';

/** Las palabras de rol que depende del sector del centro («alumno»/«cliente», «profesor»…). */
export interface ScanRoleWords {
  clientWord: string;
  staffWord: string;
}

export interface ScanVerdict {
  isGranted: boolean;
  /** «Puede entrar» o «No puede entrar». */
  headline: string;
  /** El porqué en una línea: el bono vigente, o lo que falla. */
  reasonLine: string;
  /** «Alumno», «Profesor» o «Administración». */
  roleLabel: string;
}

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

function describeRole(role: CheckInResponseDto['person']['role'], words: ScanRoleWords): string {
  if (role === 'client') return capitalize(words.clientWord);
  if (role === 'staff') return capitalize(words.staffWord);
  return i18n.t('attendance.scan.roleAdmin');
}

type AccessReason = CheckInResponseDto['access']['reason'];

/** Los motivos que se dicen siempre igual, sin datos del bono. */
const STATIC_REASON_KEYS = {
  team_member: 'attendance.scan.reasonTeamMember',
  passes_not_required: 'attendance.scan.reasonPassesNotRequired',
  pass_pending: 'attendance.scan.reasonPassPending',
  pass_exhausted: 'attendance.scan.reasonPassExhausted',
  no_pass: 'attendance.scan.reasonNoPass',
} as const satisfies Partial<Record<AccessReason, string>>;

function describeBonusReason(access: CheckInResponseDto['access'], timeZone: string): string {
  const { pass } = access;
  if (access.reason === 'pass_expired') {
    return pass?.expiresAt == null
      ? i18n.t('attendance.scan.reasonPassExpiredNoDate')
      : i18n.t('attendance.scan.reasonPassExpired', {
          date: formatShortDate(pass.expiresAt, timeZone),
        });
  }
  return i18n.t('attendance.scan.reasonValidPass', {
    name: pass?.name ?? '',
    remaining: pass?.remainingSessions ?? 0,
    total: pass?.totalSessions ?? 0,
  });
}

function describeReason(access: CheckInResponseDto['access'], timeZone: string): string {
  const { reason } = access;
  if (reason === 'valid_pass' || reason === 'pass_expired') {
    return describeBonusReason(access, timeZone);
  }
  return i18n.t(STATIC_REASON_KEYS[reason]);
}

/** Del resultado del escaneo a lo que el modal cuenta: veredicto, motivo y rol de la persona. */
export function buildScanVerdict(input: {
  checkIn: CheckInResponseDto;
  roleWords: ScanRoleWords;
  timeZone: string;
}): ScanVerdict {
  const { checkIn, roleWords, timeZone } = input;
  const { isGranted } = checkIn.access;
  return {
    isGranted,
    headline: i18n.t(
      isGranted ? 'attendance.scan.grantedHeadline' : 'attendance.scan.deniedHeadline',
    ),
    reasonLine: describeReason(checkIn.access, timeZone),
    roleLabel: describeRole(checkIn.person.role, roleWords),
  };
}
