import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterIdentityHeader } from '../components/CenterIdentityHeader';
import { useActiveCenterSummary } from '../hooks/useActiveCenterSummary';
import { useSignOut } from '../hooks/useSignOut';

interface SignedInPlaceholderScreenProps {
  /** Solo el cliente tiene ya «Mis centros» (`jcenters`). */
  canSwitchCenter: boolean;
}

/**
 * Inicio provisional de cada zona hasta APP-3 (cliente), APP-5 (staff) y APP-6 (administración).
 * Existe para poder comprobar el flujo completo: entrar, ver la marca del centro y salir.
 */
export function SignedInPlaceholderScreen({
  canSwitchCenter,
}: Readonly<SignedInPlaceholderScreenProps>): React.JSX.Element {
  const router = useRouter();
  const { signOut, isSigningOut } = useSignOut();
  const activeCenter = useActiveCenterSummary();

  return (
    <ScreenTemplate
      title={i18n.t('auth.session.placeholderTitle', { centerName: activeCenter.name })}
      isHeaderCentered
      headerAccessory={
        <CenterIdentityHeader centerName={activeCenter.name} logoUrl={activeCenter.logoUrl} />
      }
      footer={
        <Button
          variant="outline"
          leadingIconName="logOut"
          label={i18n.t('actions.signOut')}
          isFullWidth
          isLoading={isSigningOut}
          onPress={signOut}
        />
      }
    >
      <Text color="ink2">{i18n.t('auth.session.placeholderDescription')}</Text>
      {canSwitchCenter ? (
        <Button
          variant="secondary"
          label={i18n.t('join.centers.title')}
          onPress={() => {
            router.push('/(client)/centers');
          }}
        />
      ) : null}
    </ScreenTemplate>
  );
}
