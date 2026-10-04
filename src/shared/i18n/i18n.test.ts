import { APP_LANGUAGE, createI18n } from './i18n';

describe('createI18n', () => {
  it('is ready synchronously and resolves keys in es-ES', () => {
    const instance = createI18n();

    expect(instance.language).toBe(APP_LANGUAGE);
    expect(instance.t('errors.INVALID_CREDENTIALS')).toBe('Correo o contraseña incorrectos');
  });
});
