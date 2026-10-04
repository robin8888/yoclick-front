import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';

export default function StaffLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="staff">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGate>
  );
}
