import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { FormTextField } from '@/ui/molecules/FormTextField';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { GroupChoiceFields } from '../components/GroupChoiceFields';
import { useNewGroupForm } from '../hooks/useNewGroupForm';

/** Prototipo `aclients`, «Crear grupo»: nombre, nivel y quién lo da. */
export function NewGroupScreen(): React.JSX.Element {
  const router = useRouter();
  const form = useNewGroupForm();

  return (
    <ScreenTemplate
      title={i18n.t('clients.groupForm.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={form.isSaving}
      footer={
        <Button isFullWidth label={i18n.t('clients.groupForm.saveAction')} onPress={form.submit} />
      }
    >
      <FormTextField
        control={form.control}
        name="name"
        label={i18n.t('clients.groupForm.nameLabel')}
        placeholder={i18n.t('clients.groupForm.namePlaceholder')}
      />
      <GroupChoiceFields
        levelChoice={form.levelChoice}
        instructorChoice={form.instructorChoice}
        onLevelChoose={form.chooseLevel}
        onInstructorChoose={form.chooseInstructor}
      />
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
    </ScreenTemplate>
  );
}
