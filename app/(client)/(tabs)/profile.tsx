import { SignedInPlaceholderScreen } from '@/features/auth';

// Perfil del alumno: identidad, cambio de centro y cerrar sesión (el resto del perfil, después).
export default function ClientProfileRoute(): React.JSX.Element {
  return <SignedInPlaceholderScreen canSwitchCenter />;
}
