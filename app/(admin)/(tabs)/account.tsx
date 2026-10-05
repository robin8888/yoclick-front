import { SignedInPlaceholderScreen } from '@/features/auth';

// Cuenta del propietario o administrador: identidad y cerrar sesión (seguridad y marca, después).
export default function AdminAccountRoute(): React.JSX.Element {
  return <SignedInPlaceholderScreen canSwitchCenter={false} />;
}
