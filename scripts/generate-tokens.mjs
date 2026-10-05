// Genera src/shared/theme/tokens.ts a partir de docs/design/tokens.json.
// Uso: npm run tokens:gen. El resultado se commitea; un test comprueba que no está desfasado.
import { readFileSync, writeFileSync } from 'node:fs';
import { EOL } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_JSON_PATH = resolve(REPOSITORY_ROOT, 'docs/design/tokens.json');
const TOKENS_MODULE_PATH = resolve(REPOSITORY_ROOT, 'src/shared/theme/tokens.ts');

function toCamelCase(kebabName) {
  return kebabName.replace(/-([a-z0-9])/g, (_match, character) => character.toUpperCase());
}

function parsePixels(pixelValue) {
  return Number.parseFloat(pixelValue.replace('px', ''));
}

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function buildColorTokens(tokensJson) {
  const colorsByMode = { light: {}, dark: {} };
  for (const token of tokensJson.color.tokens) {
    for (const mode of ['light', 'dark']) {
      colorsByMode[mode][toCamelCase(token.name)] = token.value[mode];
    }
  }
  return colorsByMode;
}

function buildNumericScale(tokens, prefix) {
  const scale = {};
  for (const token of tokens) {
    scale[toCamelCase(token.name.replace(`${prefix}-`, ''))] = parsePixels(token.value);
  }
  return scale;
}

function buildTypeStyles(tokensJson) {
  const typeStyles = {};
  for (const group of tokensJson.type.groups) {
    for (const style of group.styles) {
      const fontSize = parsePixels(style.fontSize);
      typeStyles[toCamelCase(style.name)] = {
        fontFamily: group.family,
        fontSize,
        lineHeight: parsePixels(style.lineHeight),
        fontWeight: String(style.fontWeight),
        // En el JSON el tracking va en em; React Native lo pide en puntos.
        letterSpacing: style.letterSpacing
          ? roundTo(Number.parseFloat(style.letterSpacing) * fontSize, 2)
          : 0,
      };
    }
  }
  return typeStyles;
}

function buildShadowTokens(tokensJson) {
  const shadows = { light: {}, dark: {} };
  for (const token of tokensJson.shadow.tokens) {
    for (const mode of ['light', 'dark']) {
      shadows[mode][toCamelCase(token.name.replace('shadow-', ''))] = token.value[mode];
    }
  }
  return shadows;
}

function renderConstant(constantName, value) {
  return `export const ${constantName} = ${JSON.stringify(value, null, 2)} as const;\n`;
}

function renderTokensModule(tokensJson) {
  const fontFamilies = {
    display: 'Outfit',
    sans: 'Outfit',
  };
  return [
    '// GENERADO por scripts/generate-tokens.mjs a partir de docs/design/tokens.json.',
    '// No editar a mano: ejecuta `npm run tokens:gen`.',
    '',
    renderConstant('colorTokens', buildColorTokens(tokensJson)),
    renderConstant('spaceTokens', buildNumericScale(tokensJson.spacing.tokens, 'space')),
    renderConstant('radiusTokens', buildNumericScale(tokensJson.radius.tokens, 'radius')),
    renderConstant('typeFamilyTokens', fontFamilies),
    renderConstant('typeStyleTokens', buildTypeStyles(tokensJson)),
    renderConstant('shadowTokens', buildShadowTokens(tokensJson)),
  ].join('\n');
}

function readTokensJson() {
  return JSON.parse(readFileSync(TOKENS_JSON_PATH, 'utf8'));
}

function main() {
  const expectedModule = renderTokensModule(readTokensJson());
  if (process.argv.includes('--check')) {
    const isUpToDate = readFileSync(TOKENS_MODULE_PATH, 'utf8') === expectedModule;
    if (!isUpToDate) {
      process.stderr.write(`tokens.ts está desfasado: ejecuta npm run tokens:gen${EOL}`);
      process.exitCode = 1;
    }
    return;
  }
  writeFileSync(TOKENS_MODULE_PATH, expectedModule);
}

main();
