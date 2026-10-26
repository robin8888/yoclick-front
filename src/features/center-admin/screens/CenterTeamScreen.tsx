import { useRouter } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { TeamSection } from '../components/TeamSection';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

/** El equipo del centro: verlo, escribirle e invitar a alguien nuevo, desde el inicio del centro. */
export function CenterTeamScreen(): React.JSX.Element {
  const router = useRouter();
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());

  return (
    <ScreenTemplate
      title={capitalize(vocabulary.staff.plural)}
      subtitle={i18n.t('centerAdmin.team.screenSubtitle', { staffWord: vocabulary.staff.plural })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <TeamSection />
    </ScreenTemplate>
  );
}
