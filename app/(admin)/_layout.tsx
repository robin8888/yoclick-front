import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';

export default function AdminLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="admin">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGate>
  );
}
