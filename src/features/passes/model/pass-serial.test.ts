import { buildBanknoteSerial } from './pass-serial';

describe('buildBanknoteSerial', () => {
  it('uses the last six characters of the id in capitals', () => {
    expect(buildBanknoteSerial('0191d6a0-0000-7000-8000-0000000000d1')).toBe('Nº 0000D1');
  });
});
