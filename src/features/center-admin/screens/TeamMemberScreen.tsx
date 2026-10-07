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

function AvailabilityLink({ membershipId }: Readonly<{ membershipId: string }>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      leadingIconName="calendar"
      label={i18n.t('centerAdmin.team.availabilityAction')}
      isFullWidth
      onPress={() => {
        router.push({
          pathname: '/(admin)/team/availability/[membershipId]',
          params: { membershipId },
        });
      }}
    />
  );
}

function TeamMemberBody({
  editor,
}: Readonly<{ editor: ReturnType<typeof useTeamMemberEditor> }>): React.JSX.Element {
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const { draft, member } = editor;

  return (
    <>
      {draft === null ? (
        <Text color="ink2">{i18n.t('centerAdmin.team.ownerNote')}</Text>
      ) : (
        <TeamMemberFields
          draft={draft}
          staffWord={vocabulary.staff.singular}
          clientWord={vocabulary.client.plural}
          onDraftChange={editor.changeDraft}
        />
      )}
      {editor.errorMessage === null ? null : <FormErrorBanner message={editor.errorMessage} />}
      {member === undefined || draft === null ? null : (
        <AvailabilityLink membershipId={member.membershipId} />
      )}
      {member === undefined || draft === null ? null : (
        <RemoveTeamMemberControl
          memberName={member.fullName}
          isRemoving={editor.isUpdating}
          onRemoveConfirm={editor.removeFromTeam}
        />
      )}
    </>
  );
}

interface TeamMemberContentProps {
  membershipId: string;
}

function TeamMemberContent({ membershipId }: Readonly<TeamMemberContentProps>): React.JSX.Element {
  const router = useRouter();
  const editor = useTeamMemberEditor(membershipId);
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
      <TeamMemberBody editor={editor} />
    </ScreenTemplate>
  );
}

/** Prototipo `ateam`: cambiar el rol o el cargo de alguien del equipo, o quitarlo del centro. */
export function TeamMemberScreen(): React.JSX.Element {
  const routeParams = parseTeamMemberRouteParams(useLocalSearchParams());
  if (routeParams === null) return <Redirect href="/(admin)/services" />;
  return <TeamMemberContent membershipId={routeParams.membershipId} />;
}
