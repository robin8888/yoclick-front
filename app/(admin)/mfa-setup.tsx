import { useRouter } from 'expo-router';

import { MfaSetupScreen } from '@/features/security';

export default function MfaSetupRoute(): React.JSX.Element {
  const router = useRouter();
  return <MfaSetupScreen onDone={router.back} />;
}
