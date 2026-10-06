import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';
import { ClientTabBar } from '@/features/booking';
import { TabBarFrame } from '@/ui/organisms/TabBar';

export default function ClientLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="client">
      <TabBarFrame tabBar={<ClientTabBar />}>
        <Stack screenOptions={{ headerShown: false }} />
      </TabBarFrame>
    </RoleGate>
  );
}
