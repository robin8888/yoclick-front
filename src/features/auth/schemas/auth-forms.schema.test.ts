import {
  loginFormSchema,
  mfaAppCodeFormSchema,
  mfaRecoveryCodeFormSchema,
  registerAccountFormSchema,
  registerGoalsFormSchema,
  resetPasswordFormSchema,
  verifyEmailFormSchema,
} from './auth-forms.schema';

const VALID_ACCOUNT = {
  accountRole: 'client',
  fullName: 'Marta Ruiz',
  email: 'marta@correo.es',
  // Contraseña de prueba, no una credencial real.
  // eslint-disable-next-line sonarjs/no-hardcoded-passwords
  password: 'una-clave-larga-1',
  isPrivacyAccepted: true,
  isTermsAccepted: true,
  isMarketingAccepted: false,
};

describe('loginFormSchema', () => {
  it.each([
    [{ email: 'marta@correo.es', password: 'x' }, true],
    [{ email: ' marta@correo.es ', password: 'x' }, true],
    [{ email: 'marta', password: 'x' }, false],
    [{ email: '', password: 'x' }, false],
    [{ email: 'marta@correo.es', password: '' }, false],
  ])('%j is valid: %s', (values, isExpected) => {
    expect(loginFormSchema.safeParse(values).success).toBe(isExpected);
  });

  it('trims the email', () => {
    const parsedLogin = loginFormSchema.parse({ email: ' marta@correo.es ', password: 'x' });

    expect(parsedLogin.email).toBe('marta@correo.es');
  });
});

describe('registerAccountFormSchema', () => {
  it('accepts a complete account with both required consents', () => {
    expect(registerAccountFormSchema.safeParse(VALID_ACCOUNT).success).toBe(true);
  });

  it.each([
    ['a short password', { password: 'corta' }],
    ['a one letter name', { fullName: 'M' }],
    ['the privacy consent unchecked', { isPrivacyAccepted: false }],
    ['the terms consent unchecked', { isTermsAccepted: false }],
    ['an unknown role', { accountRole: 'admin' }],
  ])('rejects %s', (_description, overrides) => {
    const result = registerAccountFormSchema.safeParse({ ...VALID_ACCOUNT, ...overrides });

    expect(result.success).toBe(false);
  });

  it('does not require the optional marketing consent', () => {
    const result = registerAccountFormSchema.safeParse({
      ...VALID_ACCOUNT,
      isMarketingAccepted: false,
    });

    expect(result.success).toBe(true);
  });
});

describe('registerGoalsFormSchema', () => {
  it('requires an experience level', () => {
    expect(registerGoalsFormSchema.safeParse({ goalIds: [] }).success).toBe(false);
  });

  it('accepts an experience level with no goals', () => {
    expect(
      registerGoalsFormSchema.safeParse({ experience: 'oneToTwoYears', goalIds: [] }).success,
    ).toBe(true);
  });
});

describe('six digit codes', () => {
  it.each([
    ['123456', true],
    [' 123456 ', true],
    ['12345', false],
    ['1234567', false],
    ['12a456', false],
  ])('verification code %j is valid: %s', (code, isExpected) => {
    expect(verifyEmailFormSchema.safeParse({ code }).success).toBe(isExpected);
    expect(mfaAppCodeFormSchema.safeParse({ code }).success).toBe(isExpected);
  });

  it('requires a long enough new password when resetting', () => {
    expect(
      resetPasswordFormSchema.safeParse({ code: '123456', newPassword: 'corta' }).success,
    ).toBe(false);
  });
});

describe('mfaRecoveryCodeFormSchema', () => {
  it.each([
    ['abcd-efgh-ijkl', true],
    ['abc', false],
    ['', false],
  ])('recovery code %j is valid: %s', (recoveryCode, isExpected) => {
    expect(mfaRecoveryCodeFormSchema.safeParse({ recoveryCode }).success).toBe(isExpected);
  });
});
