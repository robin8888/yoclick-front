import { useRouter } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { JoinOptionCard } from './JoinOptionCard';

/** Para instructores y profesores: entran con el código de invitación que les dio su centro. */
function StaffInvitationOption(): React.JSX.Element {
  const router = useRouter();

  return (
    <JoinOptionCard
      iconName="mail"
      title={i18n.t('join.start.staffOptionTitle')}
      description={i18n.t('join.start.staffOptionDescription')}
      onPress={() => {
        router.push('/join/invitation');
      }}
    />
  );
}

/**
 * Las formas de unirse a un centro: QR, código o búsqueda; y, con sesión, el código de invitación
 * que reciben instructores y profesores (nadie sabe aún qué papel tiene hasta que entra en un centro).
 */
export function JoinStartOptions(): React.JSX.Element {
  const router = useRouter();
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');

  return (
    <>
      <JoinOptionCard
        iconName="qrCode"
        title={i18n.t('join.start.qrOptionTitle')}
        description={i18n.t('join.start.qrOptionDescription')}
        onPress={() => {
          router.push('/join/scan');
        }}
      />
      <JoinOptionCard
        iconName="lock"
        title={i18n.t('join.start.codeOptionTitle')}
        description={i18n.t('join.start.codeOptionDescription')}
        onPress={() => {
          router.push('/join/code');
        }}
      />
      <JoinOptionCard
        iconName="search"
        title={i18n.t('join.start.searchOptionTitle')}
        description={i18n.t('join.start.searchOptionDescription')}
        onPress={() => {
          router.push('/join/search');
        }}
      />
      {isSignedIn ? <StaffInvitationOption /> : null}
    </>
  );
}
