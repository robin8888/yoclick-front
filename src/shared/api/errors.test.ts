import esES from '@/shared/i18n/es-ES.json';

import { ApiError, NetworkError } from './api-error';
import { getApiErrorMessage, getFieldErrorMessage, KNOWN_API_ERROR_CODES } from './errors';

const KNOWN_CODES: readonly string[] = KNOWN_API_ERROR_CODES;
const CLIENT_ONLY_CODES = ['UNKNOWN_ERROR', 'NETWORK_OFFLINE', 'NETWORK_TIMEOUT'];
const messagesByCode: Readonly<Record<string, string>> = esES.errors;

describe('API error messages', () => {
  it.each(KNOWN_API_ERROR_CODES)('has an es-ES message for the backend code %s', (code) => {
    const apiError = new ApiError({ code, status: 400 });

    expect(messagesByCode[code]?.trim()).toBeTruthy();
    expect(getApiErrorMessage(apiError)).toBe(messagesByCode[code]);
  });

  it('has no orphan messages: every entry is a known code or a client-side failure', () => {
    const orphanCodes = Object.keys(messagesByCode).filter(
      (code) => !KNOWN_CODES.includes(code) && !CLIENT_ONLY_CODES.includes(code),
    );

    expect(orphanCodes).toEqual([]);
  });

  it('translates by code and ignores whatever title the server sent', () => {
    const apiError = new ApiError({ code: 'INVALID_CREDENTIALS', status: 401 });

    expect(getApiErrorMessage(apiError)).toBe('Correo o contraseña incorrectos');
  });

  it.each([
    ['an unknown backend code', new ApiError({ code: 'SOMETHING_NEW', status: 400 })],
    ['a plain Error', new Error('boom')],
    ['a thrown string', 'boom'],
  ])('falls back to the generic message for %s', (_label, failure) => {
    expect(getApiErrorMessage(failure)).toBe('Algo ha salido mal. Inténtalo de nuevo');
  });

  it.each([
    ['offline', 'No hay conexión. Comprueba tu internet e inténtalo de nuevo'],
    ['timeout', 'La conexión es lenta y no hemos podido terminar. Inténtalo de nuevo'],
  ] as const)('explains a %s network failure', (reason, expectedMessage) => {
    expect(getApiErrorMessage(new NetworkError(reason))).toBe(expectedMessage);
  });

  it('never blames the user in the generic messages', () => {
    const genericMessages = ['UNKNOWN_ERROR', 'INTERNAL_ERROR', 'NETWORK_OFFLINE'].map(
      (code) => messagesByCode[code] ?? '',
    );

    genericMessages.forEach((message) => {
      expect(message).not.toMatch(/\b(error tuyo|has fallado|tu culpa|incorrectamente)\b/i);
    });
  });
});

describe('field error messages', () => {
  it.each([
    ['too_short', 'Es demasiado corto'],
    ['invalid_format', 'El formato no es válido'],
    ['taken', 'Ya está en uso'],
    ['a_code_we_do_not_know', 'Revisa este campo'],
  ])('maps the field code %s to «%s»', (code, expectedMessage) => {
    expect(getFieldErrorMessage({ path: 'email', code })).toBe(expectedMessage);
  });
});
