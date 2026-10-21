import { Stack } from 'expo-router';

import { RoleGate } from '@/features/auth';

export default function PlatformLayout(): React.JSX.Element {
  return (
    <RoleGate allowedKind="platform">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGate>
  );
}
