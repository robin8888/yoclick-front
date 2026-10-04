import { Stack } from 'expo-router';

import { SignedOutOnlyGate } from '@/features/auth';

export default function AuthLayout(): React.JSX.Element {
  return (
    <SignedOutOnlyGate>
      <Stack screenOptions={{ headerShown: false }} />
    </SignedOutOnlyGate>
  );
}
