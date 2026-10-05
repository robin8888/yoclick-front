import { Tabs } from 'expo-router';

import { StaffTabBar } from '@/features/staff-agenda';

export default function StaffTabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(tabBarProps) => <StaffTabBar {...tabBarProps} />}
    >
      <Tabs.Screen name="agenda" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
