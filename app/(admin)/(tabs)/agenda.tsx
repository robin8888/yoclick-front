import { SignedInPlaceholderScreen } from '@/features/auth';

// Provisional hasta APP-6 (pantalla `aagenda`).
export default function AdminAgendaRoute(): React.JSX.Element {
  return <SignedInPlaceholderScreen canSwitchCenter={false} />;
}
