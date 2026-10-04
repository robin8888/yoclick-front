import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { YOCLICK_LOGO_MARKUP } from './brand-logo-markup';

function readLogoFile(fileName: string): string {
  return readFileSync(resolve(__dirname, '../../../assets/brand', fileName), 'utf8').trim();
}

describe('YOCLICK_LOGO_MARKUP', () => {
  it.each([
    ['symbol', 'yoclick-symbol.svg'],
    ['wordmarkLight', 'yoclick-wordmark-light.svg'],
    ['wordmarkDark', 'yoclick-wordmark-dark.svg'],
  ] as const)('%s matches assets/brand/%s', (markupName, fileName) => {
    expect(YOCLICK_LOGO_MARKUP[markupName]).toBe(readLogoFile(fileName));
  });
});
