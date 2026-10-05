import { centerDetailsFormSchema } from './center-details.schema';

const VALID_DETAILS = {
  name: 'Vértice Training',
  sectorId: 'gym',
  city: 'Zaragoza',
  brandColor: '#2446C7',
  isListed: false,
};

describe('centerDetailsFormSchema', () => {
  it('accepts valid details', () => {
    expect(centerDetailsFormSchema.safeParse(VALID_DETAILS).success).toBe(true);
  });

  it.each([
    ['a one-letter name', { name: 'V' }],
    ['a name with only spaces', { name: '   ' }],
    ['an unknown sector', { sectorId: 'pizzeria' }],
    ['a color without the hash', { brandColor: '2446C7' }],
    ['a three-digit color', { brandColor: '#24C' }],
  ])('rejects %s', (_caseName, override) => {
    expect(centerDetailsFormSchema.safeParse({ ...VALID_DETAILS, ...override }).success).toBe(
      false,
    );
  });

  it('allows an empty city because it is optional', () => {
    expect(centerDetailsFormSchema.safeParse({ ...VALID_DETAILS, city: '' }).success).toBe(true);
  });
});
