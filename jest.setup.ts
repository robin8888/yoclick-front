import '@testing-library/react-native/matchers';

// El módulo nativo de zonas seguras no existe en Jest: se usa el mock oficial de la librería.
jest.mock('react-native-safe-area-context', () => {
  const safeAreaMock: unknown = jest.requireActual('react-native-safe-area-context/jest/mock');
  return (safeAreaMock as { default: unknown }).default;
});
