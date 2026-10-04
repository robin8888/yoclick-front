import { defineConfig } from 'orval';

const API_CONTRACT_PATH = 'docs/api/openapi.yaml';
const GENERATED_DIRECTORY = 'src/shared/api/generated';

// Dos salidas del mismo contrato: hooks de TanStack Query con MSW, y esquemas zod
// para validar respuestas y formularios (SEC-14, SEC-15).
export default defineConfig({
  yoclickClient: {
    input: API_CONTRACT_PATH,
    output: {
      mode: 'tags-split',
      target: `${GENERATED_DIRECTORY}/endpoints`,
      schemas: `${GENERATED_DIRECTORY}/model`,
      client: 'react-query',
      httpClient: 'fetch',
      mock: true,
      clean: true,
      prettier: false,
      override: {
        mutator: { path: 'src/shared/api/api-mutator.ts', name: 'apiMutator' },
        // Los errores se lanzan como ApiError desde el cliente, no se devuelven en la uni�n.
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
  yoclickZod: {
    input: API_CONTRACT_PATH,
    output: {
      mode: 'tags-split',
      target: `${GENERATED_DIRECTORY}/zod`,
      client: 'zod',
      fileExtension: '.zod.ts',
      clean: true,
    },
  },
});
