import { Redirect, useRouter } from 'expo-router';
import { useWatch } from 'react-hook-form';

import { usePendingCenterStore } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { getSectorVocabulary } from '@/shared/i18n/sector-vocabulary';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ExperienceField } from '../components/ExperienceField';
import { StartingLevelNote } from '../components/StartingLevelNote';
import { GoalsField } from '../components/GoalsField';
import { useRegisterGoalsForm } from '../hooks/useRegisterGoalsForm';
import type { ExperienceDuration } from '../model/starting-level';

// Logotipo completo en blanco, del mismo tamaño que en el inicio de sesión y el registro.
const GOALS_LOGO_HEIGHT = 110;

/** Prototipo `reg2`: el nivel inicial sale de la experiencia y el sector del centro. */
export function RegisterGoalsScreen(): React.JSX.Element {
  const router = useRouter();
  const sectorId = usePendingCenterStore((state) => state.pendingCenter?.sectorId);
  const form = useRegisterGoalsForm();
  const experience = useWatch({ control: form.control, name: 'experience' }) as
    ExperienceDuration | undefined;
  const vocabulary = getSectorVocabulary(sectorId);

  if (!form.hasDraft) return <Redirect href="/(auth)/register" />;
  return (
    <ScreenTemplate
      title={i18n.t('auth.register.goalsTitle')}
      subtitle={i18n.t('auth.register.goalsSubtitle', { sessionPlural: vocabulary.session.plural })}
      isLoading={form.isSubmitting}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<Logo variant="lockup" height={GOALS_LOGO_HEIGHT} />}
      footer={
        <Button
          label={i18n.t('auth.register.submitLabel')}
          isFullWidth
          isLoading={form.isSubmitting}
          onPress={form.submitRegistration}
        />
      }
    >
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <ExperienceField control={form.control} />
      <GoalsField control={form.control} />
      <StartingLevelNote experience={experience} sectorId={sectorId} />
    </ScreenTemplate>
  );
}
