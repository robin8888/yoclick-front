import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';
import { ChatRealtimeBridge } from '@/features/chat';
import { StaffTabBar } from '@/features/staff-agenda';
import { TabBarFrame } from '@/ui/organisms/TabBar';

export default function StaffLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="staff">
      <ChatRealtimeBridge />
      <TabBarFrame tabBar={<StaffTabBar />}>
        <Stack screenOptions={{ headerShown: false }} />
      </TabBarFrame>
    </RoleGate>
  );
}
