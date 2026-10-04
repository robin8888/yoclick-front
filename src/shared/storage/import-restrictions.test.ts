import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// SEC-03 / SEC-33: los almacenes nativos solo se tocan desde src/shared/storage. ESLint lo
// comprueba al editar; este test lo repite en CI por si alguien desactiva la regla.
const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const SCANNED_DIRECTORIES = ['src', 'app'];
const STORAGE_DIRECTORY = ['src', 'shared', 'storage'].join(sep);
const RESTRICTED_MODULES = ['expo-secure-store', '@react-native-async-storage/async-storage'];
// Cualquier menci�n entre comillas cuenta (import, require, jest.mock): fuera de storage no debe haberla.
const SOURCE_FILE_PATTERN = /\.(ts|tsx)$/;

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entryName) => {
    const entryPath = join(directory, entryName);
    if (statSync(entryPath).isDirectory()) return listSourceFiles(entryPath);
    return SOURCE_FILE_PATTERN.test(entryName) ? [entryPath] : [];
  });
}

function importsRestrictedModule(sourceText: string): boolean {
  return RESTRICTED_MODULES.some(
    (moduleName) =>
      sourceText.includes(`'${moduleName}'`) || sourceText.includes(`"${moduleName}"`),
  );
}

describe('native storage imports', () => {
  it('only src/shared/storage imports expo-secure-store or AsyncStorage', () => {
    const offendingFiles = SCANNED_DIRECTORIES.flatMap((directory) =>
      listSourceFiles(join(PROJECT_ROOT, directory)),
    )
      .map((filePath) => relative(PROJECT_ROOT, filePath))
      .filter((relativePath) => !relativePath.startsWith(STORAGE_DIRECTORY))
      .filter((relativePath) => !relativePath.endsWith('import-restrictions.test.ts'))
      .filter((relativePath) =>
        importsRestrictedModule(readFileSync(join(PROJECT_ROOT, relativePath), 'utf8')),
      );

    expect(offendingFiles).toEqual([]);
  });

  it('detects a restricted import', () => {
    expect(importsRestrictedModule("import * as SecureStore from 'expo-secure-store';")).toBe(true);
    expect(importsRestrictedModule("import { format } from 'date-fns';")).toBe(false);
  });
});
