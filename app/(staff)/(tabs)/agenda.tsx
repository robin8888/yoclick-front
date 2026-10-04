import { SignedInPlaceholderScreen } from '@/features/auth';

// Provisional hasta APP-5 (pantalla `iagenda`).
export default function StaffAgendaRoute(): React.JSX.Element {
  return <SignedInPlaceholderScreen canSwitchCenter={false} />;
}
