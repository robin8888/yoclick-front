import { resolveApiAssetUrl } from './asset-url';

jest.mock('./api-config', () => ({ getApiBaseUrl: () => 'https://api.example.com' }));

describe('resolveApiAssetUrl', () => {
  it('prefixes a relative API path with the API origin', () => {
    expect(resolveApiAssetUrl('/v1/centers/abc/logo?v=123')).toBe(
      'https://api.example.com/v1/centers/abc/logo?v=123',
    );
  });

  it.each([null, undefined, '', 'https://evil.example.com/logo.png', 'v1/centers/abc/logo'])(
    'returns null for %s so the app never loads an image from an arbitrary host',
    (assetPath) => {
      expect(resolveApiAssetUrl(assetPath)).toBeNull();
    },
  );
});
