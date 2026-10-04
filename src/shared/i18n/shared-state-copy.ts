import { i18n } from './i18n';

export interface SharedStateCopy {
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly retryLabel: string;
  readonly offlineMessage: string;
  readonly forceUpdateTitle: string;
  readonly forceUpdateMessage: string;
  readonly forceUpdateButtonLabel: string;
}

export function formatSupportCode(traceId: string): string {
  return i18n.t('states.error.supportCode', { code: traceId });
}

/** Textos de los estados compartidos (cargando, error, sin conexión, actualización obligatoria). */
export function getSharedStateCopy(): SharedStateCopy {
  return {
    loadingLabel: i18n.t('states.loading.label'),
    errorTitle: i18n.t('states.error.title'),
    retryLabel: i18n.t('states.error.retryLabel'),
    offlineMessage: i18n.t('states.offline.message'),
    forceUpdateTitle: i18n.t('states.forceUpdate.title'),
    forceUpdateMessage: i18n.t('states.forceUpdate.message'),
    forceUpdateButtonLabel: i18n.t('states.forceUpdate.buttonLabel'),
  };
}
