import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';
import { ChatRealtimeBridge } from '@/features/chat';
import { AdminTabBar } from '@/features/staff-agenda';
import { TabBarFrame } from '@/ui/organisms/TabBar';

export default function AdminLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="admin">
      <ChatRealtimeBridge />
      <TabBarFrame tabBar={<AdminTabBar />}>
        <Stack screenOptions={{ headerShown: false }} />
      </TabBarFrame>
    </RoleGate>
  );
}
