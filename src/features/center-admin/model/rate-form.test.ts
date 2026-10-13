import {
  buildEmptyRateForm,
  mapRateFormToCreateRequest,
  parsePriceInCents,
  rateFormSchema,
} from './rate-form';

describe('parsePriceInCents', () => {
  it.each([
    ['45', 4500],
    ['45,5', 4550],
    ['45.50', 4550],
    ['0', 0],
    [' 12,05 ', 1205],
  ])('reads %s as %i cents', (text, expected) => {
    expect(parsePriceInCents(text)).toBe(expected);
  });

  it.each([[''], ['abc'], ['-3'], ['4,567'], ['10001']])('rejects %s', (text) => {
    expect(parsePriceInCents(text)).toBeNull();
  });
});

describe('rateFormSchema', () => {
  const VALID = {
    name: 'Bono 10 clases',
    sessionsCount: '10',
    validDays: '60',
    price: '55',
    serviceIds: [],
  };

  it('accepts a complete form', () => {
    expect(rateFormSchema.safeParse(VALID).success).toBe(true);
  });

  it.each([
    ['name', { name: ' ' }],
    ['sessionsCount', { sessionsCount: '0' }],
    ['sessionsCount', { sessionsCount: '2,5' }],
    ['validDays', { validDays: '731' }],
    ['price', { price: 'gratis' }],
  ])('rejects a bad %s', (field, change) => {
    const result = rateFormSchema.safeParse({ ...VALID, ...change });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path[0]).toBe(field);
  });

  it('maps the form to the request, with the price in cents', () => {
    expect(mapRateFormToCreateRequest({ ...VALID, price: '55,5' })).toEqual({
      name: 'Bono 10 clases',
      sessionsCount: 10,
      validDays: 60,
      priceCents: 5550,
      serviceIds: [],
    });
  });

  it('starts with ten classes for thirty days', () => {
    expect(buildEmptyRateForm()).toMatchObject({ sessionsCount: '10', validDays: '30' });
  });
});
