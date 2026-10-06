import { useAssignableStaff } from '@/features/center-admin';
import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';

import { buildLevelChoices, type ClientLevelId } from '../model/client-display';
import { isClientLevelId, NO_CHOICE } from '../model/group-form';
import { ChoiceButtons } from './ChoiceButtons';

interface GroupChoiceFieldsProps {
  levelChoice: ClientLevelId | typeof NO_CHOICE;
  instructorChoice: string;
  onLevelChoose: (levelChoice: ClientLevelId | typeof NO_CHOICE) => void;
  onInstructorChoose: (instructorChoice: string) => void;
}

/** Nivel (con el vocabulario del sector) y responsable de un grupo nuevo. */
export function GroupChoiceFields({
  levelChoice,
  instructorChoice,
  onLevelChoose,
  onInstructorChoose,
}: Readonly<GroupChoiceFieldsProps>): React.JSX.Element {
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const staff = useAssignableStaff();
  const levelChoices = buildLevelChoices(vocabulary.levels, i18n.t('clients.groupForm.noLevel'));
  const instructorChoices = [
    { value: NO_CHOICE, label: i18n.t('clients.groupForm.noInstructor') },
    ...staff.members.map((member) => ({ value: member.membershipId, label: member.fullName })),
  ];

  return (
    <>
      <ChoiceButtons
        title={i18n.t('clients.groupForm.levelLabel')}
        choices={levelChoices}
        selectedValue={levelChoice}
        onChoose={(value) => {
          onLevelChoose(isClientLevelId(value) ? value : NO_CHOICE);
        }}
      />
      <ChoiceButtons
        title={i18n.t('clients.groupForm.instructorLabel')}
        choices={instructorChoices}
        selectedValue={instructorChoice}
        onChoose={onInstructorChoose}
      />
    </>
  );
}
