import { Tabs } from 'expo-router';

import { ClientTabBar } from '@/features/booking';

export default function ClientTabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(tabBarProps) => <ClientTabBar {...tabBarProps} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="book" />
      <Tabs.Screen name="bookings" />
    </Tabs>
  );
}
