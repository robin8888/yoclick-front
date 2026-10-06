import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';
import { AdminSecurityGate } from '@/features/security';
import { AdminTabBar } from '@/features/staff-agenda';
import { TabBarFrame } from '@/ui/organisms/TabBar';

export default function AdminLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="admin">
      <AdminSecurityGate>
        <TabBarFrame tabBar={<AdminTabBar />}>
          <Stack screenOptions={{ headerShown: false }} />
        </TabBarFrame>
      </AdminSecurityGate>
    </RoleGate>
  );
}
