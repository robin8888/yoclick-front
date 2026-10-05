import { SignedInPlaceholderScreen } from '@/features/auth';

// Cuenta del instructor: de momento su identidad y cerrar sesión (el perfil llega con APP-8).
export default function StaffAccountRoute(): React.JSX.Element {
  return <SignedInPlaceholderScreen canSwitchCenter={false} />;
}
