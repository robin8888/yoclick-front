import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';
import { StaffTabBar } from '@/features/staff-agenda';
import { TabBarFrame } from '@/ui/organisms/TabBar';

export default function StaffLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="staff">
      <TabBarFrame tabBar={<StaffTabBar />}>
        <Stack screenOptions={{ headerShown: false }} />
      </TabBarFrame>
    </RoleGate>
  );
}
