import { useRouter } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { useTeamRoster } from '../hooks/useTeamRoster';
import { buildInvitePersonRoute } from '../model/invite-person-route';
import { selectRosterMembers } from '../model/team-roster';
import { SectionHeader } from './SectionHeader';
import { TeamMemberRow } from './TeamMemberRow';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

/** Prototipo `asvc`, «Instructores»: el equipo con «Invitar» y acceso para editar a cada persona. */
export function TeamSection(): React.JSX.Element {
  const router = useRouter();
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const roster = useTeamRoster();
  const members = selectRosterMembers(roster.data?.members ?? []);

  return (
    <>
      <SectionHeader
        title={capitalize(vocabulary.staff.plural)}
        actionLabel={i18n.t('centerAdmin.team.inviteAction')}
        actionIconName="mail"
        onActionPress={() => {
          router.push(buildInvitePersonRoute('staff'));
        }}
      />
      {roster.isError ? <Text color="danger">{i18n.t('centerAdmin.team.loadError')}</Text> : null}
      {members.map((member) => (
        <TeamMemberRow
          key={member.membershipId}
          member={member}
          staffWord={capitalize(vocabulary.staff.singular)}
          onPress={() => {
            router.push({
              pathname: '/(admin)/team/[membershipId]',
              params: { membershipId: member.membershipId },
            });
          }}
        />
      ))}
    </>
  );
}
