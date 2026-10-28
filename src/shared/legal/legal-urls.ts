import Constants from 'expo-constants';
import { z } from 'zod';

export interface LegalUrls {
  readonly privacyPolicy: string;
  readonly termsOfService: string;
}

// Provisionales hasta publicar las páginas en el dominio definitivo (docs/spec/14).
export const DEFAULT_LEGAL_URLS: LegalUrls = {
  privacyPolicy: 'https://yoclick.app/privacidad',
  termsOfService: 'https://yoclick.app/condiciones',
};

// Solo HTTPS (SEC-19): un texto legal no se sirve por una conexión sin cifrar.
const httpsUrlSchema = z.url({ protocol: /^https$/ });

const legalUrlsSchema = z.object({
  privacyPolicy: httpsUrlSchema,
  termsOfService: httpsUrlSchema,
});

/** `extra.legalUrls` (app.config.ts) manda; si falta o no es válido, se usan las direcciones por defecto. */
export function resolveLegalUrls(extraLegalUrls: unknown): LegalUrls {
  const parsedUrls = legalUrlsSchema.safeParse(extraLegalUrls);
  return parsedUrls.success ? parsedUrls.data : DEFAULT_LEGAL_URLS;
}

// Provisional hasta tener el dominio y el buzón definitivos.
export const DEFAULT_SUPPORT_EMAIL = 'soporte@yoclick.app';

/** `extra.supportEmail` (app.config.ts) manda; si falta o no es un correo válido, se usa el de por defecto. */
export function resolveSupportEmail(extraSupportEmail: unknown): string {
  const parsedEmail = z.email().safeParse(extraSupportEmail);
  return parsedEmail.success ? parsedEmail.data : DEFAULT_SUPPORT_EMAIL;
}

const appConfigExtraSchema = z.object({ legalUrls: z.unknown(), supportEmail: z.unknown() });

export function getLegalUrls(): LegalUrls {
  const appConfigExtra = appConfigExtraSchema.safeParse(Constants.expoConfig?.extra);
  return resolveLegalUrls(appConfigExtra.success ? appConfigExtra.data.legalUrls : undefined);
}

export function getSupportEmail(): string {
  const appConfigExtra = appConfigExtraSchema.safeParse(Constants.expoConfig?.extra);
  return resolveSupportEmail(appConfigExtra.success ? appConfigExtra.data.supportEmail : undefined);
}
