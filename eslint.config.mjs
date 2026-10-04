import js from '@eslint/js';
import { fixupPluginRules } from '@eslint/compat';
import boundaries from 'eslint-plugin-boundaries';
import prettierConfig from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Nombres vagos prohibidos como identificadores propios. Se usa `naming-convention`
// con `custom` y no `id-denylist` porque este último también marca claves de objeto
// que imponen las librerías (p. ej. `data` en una respuesta de Query).
const VAGUE_IDENTIFIER_PATTERN =
  '^(data|info|tmp|temp|obj|val|res|arr|foo|bar|item\\d+|thing|stuff|flag|cb|fn)$';

const BOOLEAN_PREFIXES = ['is', 'has', 'can', 'should', 'are'];

const MAX_LINES_PER_FUNCTION = 40;
const MAX_PARAMS = 3;
const MAX_DEPTH = 3;
const MAX_COMPLEXITY = 10;

const namingConventionRules = [
  {
    // Los booleanos desestructurados vienen de librerías y no se pueden renombrar.
    selector: 'variable',
    modifiers: ['destructured'],
    format: null,
  },
  {
    selector: ['variable', 'parameter'],
    types: ['boolean'],
    format: ['PascalCase'],
    prefix: BOOLEAN_PREFIXES,
    leadingUnderscore: 'allow',
  },
  {
    selector: 'variable',
    modifiers: ['global', 'const'],
    types: ['number', 'string', 'array'],
    format: ['UPPER_CASE', 'camelCase'],
    custom: { regex: VAGUE_IDENTIFIER_PATTERN, match: false },
  },
  {
    selector: 'variable',
    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    custom: { regex: VAGUE_IDENTIFIER_PATTERN, match: false },
  },
  {
    selector: 'parameter',
    format: ['camelCase', 'PascalCase'],
    leadingUnderscore: 'allow',
    custom: { regex: VAGUE_IDENTIFIER_PATTERN, match: false },
  },
  {
    selector: 'function',
    format: ['camelCase', 'PascalCase'],
    custom: { regex: VAGUE_IDENTIFIER_PATTERN, match: false },
  },
  { selector: 'typeLike', format: ['PascalCase'] },
  {
    selector: 'interface',
    format: ['PascalCase'],
    custom: { regex: '^I[A-Z]', match: false },
  },
  { selector: 'enumMember', format: ['PascalCase'] },
];

const boundaryElements = [
  { type: 'app', pattern: 'app/**' },
  { type: 'test', pattern: 'src/test/**' },
  { type: 'atom', pattern: 'src/ui/atoms/*' },
  { type: 'molecule', pattern: 'src/ui/molecules/*' },
  { type: 'organism', pattern: 'src/ui/organisms/*' },
  { type: 'template', pattern: 'src/ui/templates/*' },
  { type: 'feature', pattern: 'src/features/*', capture: ['featureName'] },
  { type: 'shared-theme', pattern: 'src/shared/theme/**' },
  { type: 'shared-i18n', pattern: 'src/shared/i18n/**' },
  { type: 'shared', pattern: 'src/shared/**' },
];

const allowedTargetsByElement = {
  app: [
    'feature',
    'atom',
    'molecule',
    'organism',
    'template',
    'shared-theme',
    'shared-i18n',
    'shared',
  ],
  feature: ['atom', 'molecule', 'organism', 'template', 'shared-theme', 'shared-i18n', 'shared'],
  atom: ['shared-theme', 'shared-i18n', 'atom'],
  molecule: ['atom', 'molecule', 'shared-theme', 'shared-i18n'],
  organism: ['molecule', 'atom', 'organism', 'shared-theme', 'shared-i18n'],
  template: ['organism', 'molecule', 'atom', 'template', 'shared-theme', 'shared-i18n'],
  'shared-theme': ['shared-theme', 'shared-i18n', 'shared'],
  'shared-i18n': ['shared-theme', 'shared-i18n', 'shared'],
  shared: ['shared-theme', 'shared-i18n', 'shared'],
  test: [
    'app',
    'feature',
    'atom',
    'molecule',
    'organism',
    'template',
    'shared-theme',
    'shared-i18n',
    'shared',
    'test',
  ],
};

// Entre features solo se importa la API pública (index.ts) de la otra.
const crossFeaturePolicy = {
  from: { element: { type: 'feature' } },
  allow: {
    to: { file: { path: 'src/features/*/index.{ts,tsx}' } },
  },
};

const boundaryPolicies = Object.entries(allowedTargetsByElement)
  .map(([sourceType, targetTypes]) => ({
    from: { element: { type: sourceType } },
    allow: { to: { element: { types: { anyOf: targetTypes } } } },
  }))
  .concat(crossFeaturePolicy);

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      '.expo/**',
      'ios/**',
      'android/**',
      'src/shared/api/generated/**',
      'expo-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: [] },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node, __DEV__: 'readonly' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': fixupPluginRules(reactNative),
      sonarjs,
      boundaries,
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/elements': boundaryElements,
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/naming-convention': ['error', ...namingConventionRules],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreTypeIndexes: true,
          ignoreReadonlyClassProperties: true,
          enforceConst: true,
        },
      ],
      'id-length': ['error', { min: 2, exceptions: ['_'], properties: 'never' }],
      'max-lines-per-function': [
        'error',
        { max: MAX_LINES_PER_FUNCTION, skipBlankLines: true, skipComments: true },
      ],
      'max-params': ['error', MAX_PARAMS],
      'max-depth': ['error', MAX_DEPTH],
      complexity: ['error', MAX_COMPLEXITY],
      'no-console': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
          message: 'Los colores hex solo viven en src/shared/theme. Usa useTheme().',
        },
        {
          selector: 'TemplateElement[value.raw=/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b/]',
          message: 'Los colores hex solo viven en src/shared/theme. Usa useTheme().',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@react-native-async-storage/async-storage',
              message: 'Usa src/shared/storage/public-cache.ts (único acceso a AsyncStorage).',
            },
            {
              name: 'expo-secure-store',
              message: 'Usa src/shared/storage/secure.ts (único acceso a SecureStore).',
            },
          ],
        },
      ],
      'react-native/no-inline-styles': 'error',
      'react-native/no-color-literals': 'error',
      'react-native/no-unused-styles': 'error',
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],

      'boundaries/dependencies': ['error', { default: 'disallow', policies: boundaryPolicies }],
    },
  },
  {
    // Los hex, números sueltos y funciones largas son normales en la definición
    // de tokens y en los tests (describe agrupa muchos casos).
    files: ['src/shared/theme/**', '**/*.test.{ts,tsx}', 'src/test/**', 'scripts/**'],
    rules: {
      'no-restricted-syntax': 'off',
      'react-native/no-color-literals': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },
  {
    // La configuración nativa se evalúa antes del tema: ahí los hex son inevitables.
    files: ['config/**', 'app.config.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['src/shared/storage/secure.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['src/shared/storage/public-cache.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // Expo Router exige export default en las rutas.
    files: ['app/**', '*.config.{js,mjs,ts}'],
    rules: { 'no-restricted-exports': 'off' },
  },
  {
    files: ['**/*.{js,mjs,cjs}', '*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: { ...globals.node, module: 'writable', require: 'readonly' } },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'boundaries/dependencies': 'off',
      'react-native/no-inline-styles': 'off',
    },
  },
  prettierConfig,
);
