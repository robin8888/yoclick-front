import '@testing-library/react-native/matchers';

// El módulo nativo de zonas seguras no existe en Jest: se usa el mock oficial de la librería.
jest.mock('react-native-safe-area-context', () => {
  const safeAreaMock: unknown = jest.requireActual('react-native-safe-area-context/jest/mock');
  return (safeAreaMock as { default: unknown }).default;
});

// Expo Router necesita el árbol de navegación real; en los tests de pantalla se sustituye por un
// router falso cuyas llamadas se comprueban con `getMockRouter()` (src/test/mock-router.ts).
jest.mock('expo-router', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const reactNative = jest.requireActual<typeof import('react-native')>('react-native');
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  return {
    useRouter: () => mockRouter,
    useLocalSearchParams: jest.fn(() => ({})),
    Redirect: ({ href }: { href: string }) =>
      react.createElement(reactNative.Text, null, `redirect:${href}`),
    Stack: () => null,
    __mockRouter: mockRouter,
  };
});
