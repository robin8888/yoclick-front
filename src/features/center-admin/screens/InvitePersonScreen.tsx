import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useCenterIdentity } from '@/shared/theme';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { InvitationReadyCard } from '../components/InvitationReadyCard';
import { InviteContactForm } from '../components/InviteContactForm';
import { PendingInvitationsList } from '../components/PendingInvitationsList';
import { useInvitePerson } from '../hooks/useInvitePerson';
import { parseInvitePersonParams, type InvitedRole } from '../model/invite-person-route';

function InvitePersonContent({ role }: Readonly<{ role: InvitedRole }>): React.JSX.Element {
  const router = useRouter();
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const centerName = useCenterIdentity()?.name ?? '';
  const roleWord = (role === 'client' ? vocabulary.client : vocabulary.staff).singular;
  const invitation = useInvitePerson(role);

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.team.title', { roleWord })}
      subtitle={i18n.t('centerAdmin.team.subtitle', { centerName })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={invitation.isInviting}
    >
      {invitation.createdInvitation === undefined ? (
        <InviteContactForm onContactSubmit={invitation.invite} />
      ) : (
        <InvitationReadyCard
          invitation={invitation.createdInvitation}
          centerName={centerName}
          roleWord={roleWord}
          onAnotherPress={invitation.startAnother}
        />
      )}
      {invitation.inviteErrorMessage === null ? null : (
        <FormErrorBanner message={invitation.inviteErrorMessage} />
      )}
      <PendingInvitationsList
        invitations={invitation.pendingInvitations}
        onResend={invitation.resendInvitation}
        onRevoke={invitation.revokeInvitation}
      />
    </ScreenTemplate>
  );
}

/** Invitar a un alumno o a un instructor: teléfono o correo, y el código listo para enviar. */
export function InvitePersonScreen(): React.JSX.Element {
  const params = parseInvitePersonParams(useLocalSearchParams());
  if (params === null) return <Redirect href="/(admin)/(tabs)/more" />;
  return <InvitePersonContent role={params.role} />;
}
