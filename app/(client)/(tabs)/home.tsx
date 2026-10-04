import { SignedInPlaceholderScreen } from '@/features/auth';

// Provisional hasta APP-3 (pantalla `home`).
export default function ClientHomeRoute(): React.JSX.Element {
  return <SignedInPlaceholderScreen canSwitchCenter />;
}
