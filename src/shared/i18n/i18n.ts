import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import esES from './es-ES.json';

// Producto solo para España: no se lee el idioma del dispositivo (expo-localization se añadirá
// con el primer idioma extra, ADR 005). Las fechas y el dinero no dependen de Intl, ver shared/lib/format.
export const APP_LANGUAGE = 'es-ES';

export function createI18n(): I18nInstance {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    lng: APP_LANGUAGE,
    fallbackLng: APP_LANGUAGE,
    resources: { [APP_LANGUAGE]: { translation: esES } },
    interpolation: { escapeValue: false },
    // Los recursos están en el bundle: sin esto `t` devolvería la clave en el primer render.
    initAsync: false,
  });
  return instance;
}

export const i18n = createI18n();
