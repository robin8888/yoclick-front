import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RemoveTeamMemberControl } from '../components/RemoveTeamMemberControl';
import { TeamMemberFields } from '../components/TeamMemberFields';
import { useTeamMemberEditor } from '../hooks/useTeamMemberEditor';
import { parseTeamMemberRouteParams } from '../model/team-member-route-params';

interface TeamMemberContentProps {
  membershipId: string;
}

function TeamMemberContent({ membershipId }: Readonly<TeamMemberContentProps>): React.JSX.Element {
  const router = useRouter();
  const editor = useTeamMemberEditor(membershipId);
  const staffWord = getSectorVocabulary(useActiveCenterSectorId()).staff.singular;
  const { draft, member } = editor;

  return (
    <ScreenTemplate
      title={member?.fullName ?? i18n.t('centerAdmin.team.memberTitle')}
      subtitle={member?.email}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={editor.isUpdating}
      footer={
        draft === null ? undefined : (
          <Button
            isFullWidth
            label={i18n.t('centerAdmin.team.saveAction')}
            isDisabled={editor.changes === null}
            onPress={editor.saveChanges}
          />
        )
      }
    >
      {draft === null ? (
        <Text color="ink2">{i18n.t('centerAdmin.team.ownerNote')}</Text>
      ) : (
        <TeamMemberFields draft={draft} staffWord={staffWord} onDraftChange={editor.changeDraft} />
      )}
      {editor.errorMessage === null ? null : <FormErrorBanner message={editor.errorMessage} />}
      {member === undefined || draft === null ? null : (
        <RemoveTeamMemberControl
          memberName={member.fullName}
          isRemoving={editor.isUpdating}
          onRemoveConfirm={editor.removeFromTeam}
        />
      )}
    </ScreenTemplate>
  );
}

/** Prototipo `ateam`: cambiar el rol o el cargo de alguien del equipo, o quitarlo del centro. */
export function TeamMemberScreen(): React.JSX.Element {
  const routeParams = parseTeamMemberRouteParams(useLocalSearchParams());
  if (routeParams === null) return <Redirect href="/(admin)/services" />;
  return <TeamMemberContent membershipId={routeParams.membershipId} />;
}
