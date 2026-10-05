import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import { colorTokens, radiusTokens, shadowTokens, spaceTokens, typeStyleTokens } from './tokens';

describe('generated tokens', () => {
  it('are in sync with docs/design/tokens.json (run npm run tokens:gen)', () => {
    const generatorScriptPath = resolve(__dirname, '../../../scripts/generate-tokens.mjs');

    expect(() => execFileSync(process.execPath, [generatorScriptPath, '--check'])).not.toThrow();
  });

  it('expose the same color names for light and dark', () => {
    expect(Object.keys(colorTokens.dark)).toEqual(Object.keys(colorTokens.light));
  });

  it('convert spacing and radius to numbers in points', () => {
    expect(spaceTokens['4']).toBe(16);
    expect(radiusTokens.pill).toBe(999);
    expect(radiusTokens.md).toBe(14);
  });

  it('convert letter spacing from em to points', () => {
    expect(typeStyleTokens.overline.letterSpacing).toBeCloseTo(1.04, 2);
    expect(typeStyleTokens.display.letterSpacing).toBeCloseTo(-0.36, 2);
    expect(typeStyleTokens.body.letterSpacing).toBe(0);
  });

  it('keep shadows as CSS box-shadow strings per mode', () => {
    expect(shadowTokens.dark.sheet).toContain('rgba(0,0,0,0.6)');
  });
});
