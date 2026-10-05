import { Tabs } from 'expo-router';

import { AdminTabBar } from '@/features/staff-agenda';

export default function AdminTabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(tabBarProps) => <AdminTabBar {...tabBarProps} />}
    >
      <Tabs.Screen name="agenda" />
      <Tabs.Screen name="records" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
