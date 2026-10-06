import type { SignOutFlow } from '@/shared/auth/useSignOutFlow';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

interface SignOutActionProps {
  flow: SignOutFlow;
}

/**
 * «Cerrar sesión» para las pantallas a las que se llega ya con sesión pero sin centro (pedir el
 * código del gimnasio, crear el centro, activar el segundo factor…): nadie debe quedarse atrapado.
 * Sin sesión no se muestra.
 */
export function SignOutAction({ flow }: Readonly<SignOutActionProps>): React.JSX.Element | null {
  if (!flow.isSignedIn) return null;
  return (
    <Button
      variant="ghost"
      leadingIconName="logOut"
      label={i18n.t('actions.signOut')}
      isFullWidth
      isLoading={flow.isSigningOut}
      onPress={flow.signOut}
    />
  );
}
