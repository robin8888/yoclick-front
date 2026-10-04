import { ApiError, NetworkError, UNKNOWN_ERROR_CODE, parseApiError } from './api-error';

describe('parseApiError', () => {
  it('maps a problem+json body to a typed ApiError', () => {
    const apiError = parseApiError({
      status: 422,
      body: {
        type: 'https://api.yoclick.app/errors/validation',
        title: 'Datos no válidos',
        status: 422,
        code: 'VALIDATION_FAILED',
        traceId: '01J-TRACE',
        errors: [{ path: 'email', code: 'invalid' }],
      },
    });

    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError).toMatchObject({
      code: 'VALIDATION_FAILED',
      status: 422,
      traceId: '01J-TRACE',
      fieldErrors: [{ path: 'email', code: 'invalid' }],
    });
  });

  it.each([
    ['plain text', 'Bad gateway'],
    ['null', null],
    ['an object without code', { title: 'Oops' }],
    ['an empty code', { code: '' }],
  ])('falls back to UNKNOWN_ERROR when the body is %s', (_label, body) => {
    const apiError = parseApiError({ status: 502, body });

    expect(apiError.code).toBe(UNKNOWN_ERROR_CODE);
    expect(apiError.status).toBe(502);
    expect(apiError.fieldErrors).toEqual([]);
  });

  it('reads Retry-After in seconds for rate limits', () => {
    const apiError = parseApiError({
      status: 429,
      body: { code: 'RATE_LIMITED' },
      retryAfterHeader: '30',
    });

    expect(apiError.retryAfterSeconds).toBe(30);
  });

  it('ignores a Retry-After that is not a number of seconds', () => {
    const apiError = parseApiError({
      status: 429,
      body: { code: 'RATE_LIMITED' },
      retryAfterHeader: 'Wed, 21 Oct 2026 07:28:00 GMT',
    });

    expect(apiError.retryAfterSeconds).toBeUndefined();
  });

  it('never puts the response body in the error message', () => {
    const apiError = parseApiError({
      status: 401,
      body: { code: 'INVALID_CREDENTIALS', detail: 'marta@example.com', accessToken: 'secret' },
    });

    expect(apiError.message).toBe('INVALID_CREDENTIALS');
    expect(JSON.stringify(apiError)).not.toContain('marta@example.com');
    expect(JSON.stringify(apiError)).not.toContain('secret');
  });
});

describe('NetworkError', () => {
  it('keeps the failure reason', () => {
    expect(new NetworkError('timeout').reason).toBe('timeout');
  });
});
