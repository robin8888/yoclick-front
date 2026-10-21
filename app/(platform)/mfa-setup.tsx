import { useRouter } from 'expo-router';

import { MfaSetupScreen } from '@/features/security';

export default function PlatformMfaSetupRoute(): React.JSX.Element {
  const router = useRouter();
  return <MfaSetupScreen onDone={router.back} />;
}
