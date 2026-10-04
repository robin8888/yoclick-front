import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';

export default function ClientLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="client">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGate>
  );
}
