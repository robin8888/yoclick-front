import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';

type AuditDetails = Readonly<Record<string, unknown>>;

function readString(details: AuditDetails, key: string): string | null {
  const value = details[key];
  return typeof value === 'string' ? value : null;
}

function readNumber(details: AuditDetails, key: string): number | null {
  const value = details[key];
  return typeof value === 'number' ? value : null;
}

function describeStatusChange(details: AuditDetails): string {
  const from = readString(details, 'from');
  const to = readString(details, 'to');
  if (from === null || to === null) return i18n.t('platform.audit.unknown');
  return i18n.t('platform.audit.statusChanged', {
    from: i18n.t(`platform.status.${from as 'trial'}`),
    to: i18n.t(`platform.status.${to as 'trial'}`),
  });
}

function describeTrialChange(details: AuditDetails): string {
  const to = readString(details, 'to');
  if (to === null) return i18n.t('platform.audit.trialRemoved');
  return i18n.t('platform.audit.trialChanged', {
    to: formatShortDate(to, PLATFORM_TIME_ZONE),
  });
}

function describeCapChange(details: AuditDetails): string {
  const formatCap = (cap: number | null): string =>
    cap === null ? i18n.t('platform.audit.noCap') : String(cap);
  return i18n.t('platform.audit.capChanged', {
    from: formatCap(readNumber(details, 'from')),
    to: formatCap(readNumber(details, 'to')),
  });
}

/** La frase de una entrada del registro de auditoría; lo que no se reconoce no rompe la pantalla. */
export function describeAuditEntry(entry: { action: string; details: AuditDetails }): string {
  switch (entry.action) {
    case 'center_status_changed':
      return describeStatusChange(entry.details);
    case 'trial_changed':
      return describeTrialChange(entry.details);
    case 'max_clients_changed':
      return describeCapChange(entry.details);
    default:
      return i18n.t('platform.audit.unknown');
  }
}
