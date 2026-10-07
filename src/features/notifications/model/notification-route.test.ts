import { getNotificationsRoute } from './notification-route';

describe('getNotificationsRoute', () => {
  it.each([
    ['client', '/(client)/notifications'],
    ['staff', '/(staff)/(tabs)/notifications'],
    ['admin', '/(admin)/(tabs)/notifications'],
    ['owner', '/(admin)/(tabs)/notifications'],
    [undefined, '/(admin)/(tabs)/notifications'],
  ])('sends %s to %s', (role, expectedRoute) => {
    expect(getNotificationsRoute(role)).toBe(expectedRoute);
  });
});
