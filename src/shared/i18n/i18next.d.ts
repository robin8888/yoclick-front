import 'i18next';

import type esES from './es-ES.json';

// Con esto `t('clave.que.no.existe')` no compila: las claves salen del propio es-ES.json.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof esES };
  }
}
