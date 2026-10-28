import { useState } from 'react';
import { Linking } from 'react-native';

import { i18n } from '@/shared/i18n';

import { getLegalUrls, getSupportEmail } from './legal-urls';

export interface LegalLink {
  label: string;
  onPress: () => void;
}

interface LegalLinks {
  links: readonly LegalLink[];
  /** El sistema no pudo abrir la dirección (sin navegador, por ejemplo): se avisa en vez de no hacer nada. */
  hasOpenFailed: boolean;
}

/**
 * Los enlaces a la política de privacidad, a las condiciones del servicio y al correo de contacto (Apple 1.2:
 * información de contacto publicada). Los dos primeros se abren en el navegador y el último, en el correo.
 */
export function useLegalLinks(): LegalLinks {
  const [hasOpenFailed, setHasOpenFailed] = useState(false);
  const legalUrls = getLegalUrls();

  const openUrl = (url: string): void => {
    setHasOpenFailed(false);
    Linking.openURL(url).catch(() => {
      setHasOpenFailed(true);
    });
  };

  return {
    links: [
      {
        label: i18n.t('legal.privacyPolicy'),
        onPress: () => {
          openUrl(legalUrls.privacyPolicy);
        },
      },
      {
        label: i18n.t('legal.termsOfService'),
        onPress: () => {
          openUrl(legalUrls.termsOfService);
        },
      },
      {
        label: i18n.t('legal.contact'),
        onPress: () => {
          openUrl(`mailto:${getSupportEmail()}`);
        },
      },
    ],
    hasOpenFailed,
  };
}
