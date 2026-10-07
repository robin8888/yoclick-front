import { View } from 'react-native';

import { useActiveCenterSectorId } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';

import {
  MAX_BIO_LENGTH,
  MAX_HEADLINE_LENGTH,
  toggleChosenItem,
  type ProfileDraft,
} from '../model/profile-draft';
import {
  getSpecialtyOptions,
  LANGUAGE_OPTIONS,
  mergeWithChosen,
} from '../model/sector-specialties';
import { ChipChoiceGroup } from './ChipChoiceGroup';
import { STACK_STYLE } from './TeamProfiles.styles';

interface ProfileEditorFieldsProps {
  draft: ProfileDraft;
  onDraftChange: (draft: ProfileDraft) => void;
}

function TextInputs({
  draft,
  onDraftChange,
}: Readonly<ProfileEditorFieldsProps>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong">{i18n.t('teamProfiles.editor.headlineLabel')}</Text>
      <Input
        value={draft.headline}
        onChangeText={(headline) => {
          onDraftChange({ ...draft, headline });
        }}
        accessibilityLabel={i18n.t('teamProfiles.editor.headlineLabel')}
        placeholder={i18n.t('teamProfiles.editor.headlinePlaceholder')}
        maxLength={MAX_HEADLINE_LENGTH}
      />
      <Text variant="bodyStrong">{i18n.t('teamProfiles.editor.bioLabel')}</Text>
      <Input
        value={draft.bio}
        onChangeText={(bio) => {
          onDraftChange({ ...draft, bio });
        }}
        accessibilityLabel={i18n.t('teamProfiles.editor.bioLabel')}
        placeholder={i18n.t('teamProfiles.editor.bioPlaceholder')}
        maxLength={MAX_BIO_LENGTH}
      />
    </>
  );
}

function ChoiceGroups({
  draft,
  onDraftChange,
}: Readonly<ProfileEditorFieldsProps>): React.JSX.Element {
  const sectorOptions = getSpecialtyOptions(useActiveCenterSectorId());

  return (
    <>
      <ChipChoiceGroup
        title={i18n.t('teamProfiles.editor.specialtiesTitle')}
        options={mergeWithChosen(sectorOptions, draft.specialties)}
        chosen={draft.specialties}
        onToggle={(option) => {
          onDraftChange({ ...draft, specialties: toggleChosenItem(draft.specialties, option) });
        }}
      />
      <ChipChoiceGroup
        title={i18n.t('teamProfiles.editor.languagesTitle')}
        options={mergeWithChosen(LANGUAGE_OPTIONS, draft.languages)}
        chosen={draft.languages}
        onToggle={(option) => {
          onDraftChange({ ...draft, languages: toggleChosenItem(draft.languages, option) });
        }}
      />
    </>
  );
}

/** Titular, biografía, especialidades e idiomas: lo que se escribe y se elige en el perfil. */
export function ProfileEditorFields(props: Readonly<ProfileEditorFieldsProps>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      <TextInputs {...props} />
      <ChoiceGroups {...props} />
    </View>
  );
}
