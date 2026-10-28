import {
  DEFAULT_LEGAL_URLS,
  DEFAULT_SUPPORT_EMAIL,
  resolveLegalUrls,
  resolveSupportEmail,
} from './legal-urls';

describe('resolveLegalUrls', () => {
  it('uses the addresses configured for the build', () => {
    const configured = {
      privacyPolicy: 'https://example.org/privacy',
      termsOfService: 'https://example.org/terms',
    };

    expect(resolveLegalUrls(configured)).toEqual(configured);
  });

  it.each([
    { name: 'there is nothing configured', value: undefined },
    { name: 'one of the addresses is missing', value: { privacyPolicy: 'https://example.org/p' } },
    {
      name: 'an address does not use HTTPS',
      value: {
        privacyPolicy: 'http://example.org/privacy',
        termsOfService: 'https://example.org/terms',
      },
    },
    {
      name: 'an address is not a URL',
      value: { privacyPolicy: 'privacidad', termsOfService: 'https://example.org/terms' },
    },
    {
      name: 'the scheme is not web at all',
      value: {
        privacyPolicy: 'javascript:alert(1)',
        termsOfService: 'https://example.org/terms',
      },
    },
  ])('falls back to the default addresses when $name', ({ value }) => {
    expect(resolveLegalUrls(value)).toEqual(DEFAULT_LEGAL_URLS);
  });
});

describe('resolveSupportEmail', () => {
  it('uses the address configured for the build', () => {
    expect(resolveSupportEmail('ayuda@example.org')).toBe('ayuda@example.org');
  });

  it.each([undefined, '', 'no-es-un-correo', 42])(
    'falls back to the default address when the value is %s',
    (value) => {
      expect(resolveSupportEmail(value)).toBe(DEFAULT_SUPPORT_EMAIL);
    },
  );
});
