import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { InstructorInviteFields } from '../components/InstructorInviteFields';
import { useInviteInstructorForm } from '../hooks/useInviteInstructorForm';

/** Prototipo `o4`: invitar a instructores por correo; reciben un enlace para crear su acceso. */
export function InviteTeamScreen(): React.JSX.Element {
  const router = useRouter();
  const form = useInviteInstructorForm();

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.team.title')}
      subtitle={i18n.t('centerAdmin.team.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={form.isInviting}
    >
      <InstructorInviteFields form={form} />
    </ScreenTemplate>
  );
}
