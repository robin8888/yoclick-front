import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';
import { AdminSecurityGate } from '@/features/security';

export default function AdminLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="admin">
      <AdminSecurityGate>
        <Stack screenOptions={{ headerShown: false }} />
      </AdminSecurityGate>
    </RoleGate>
  );
}
