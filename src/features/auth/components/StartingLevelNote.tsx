import { i18n } from '@/shared/i18n';
import { getSectorVocabulary } from '@/shared/i18n/sector-vocabulary';
import { Text } from '@/ui/atoms/Text';

import { estimateStartingLevelIndex, type ExperienceDuration } from '../model/starting-level';

interface StartingLevelNoteProps {
  experience: ExperienceDuration | undefined;
  sectorId: string | undefined;
}

/** «Empezarás en nivel…»: aparece en cuanto se elige la experiencia. */
export function StartingLevelNote({
  experience,
  sectorId,
}: Readonly<StartingLevelNoteProps>): React.JSX.Element | null {
  if (experience === undefined) return null;
  const vocabulary = getSectorVocabulary(sectorId);

  return (
    <Text color="ink2" align="center">
      {i18n.t('auth.register.levelNote', {
        levelName: vocabulary.levels[estimateStartingLevelIndex(experience)],
        staffSingular: vocabulary.staff.singular,
      })}
    </Text>
  );
}
