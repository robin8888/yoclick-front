interface MockRouter {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  canGoBack: jest.Mock;
}

/** El router falso que `jest.setup.ts` instala en lugar de Expo Router. */
export function getMockRouter(): MockRouter {
  const expoRouterMock = jest.requireMock<{ __mockRouter: MockRouter }>('expo-router');
  return expoRouterMock.__mockRouter;
}

export function resetMockRouter(): void {
  const mockRouter = getMockRouter();
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockRouter.back.mockReset();
  mockRouter.canGoBack.mockReset().mockReturnValue(true);
}
