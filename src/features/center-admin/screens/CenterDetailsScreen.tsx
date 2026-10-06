import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { LoadErrorState } from '@/features/join';
import type { CenterSettingsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ContactFields, FiscalFields } from '../components/CenterDetailsTextFields';
import { SectorChoiceField, TimeZoneChoiceField } from '../components/CenterDetailsChoiceFields';
import { HolidaysSection } from '../components/HolidaysSection';
import { OpeningHoursSection } from '../components/OpeningHoursSection';
import { useCenterSettings } from '../hooks/useCenterSettings';
import { useSaveCenterSettings } from '../hooks/useSaveCenterSettings';
import {
  buildDetailsPatch,
  centerDetailsFormSchema,
  mapSettingsToDetailsForm,
  type CenterDetailsFormValues,
} from '../model/center-details-form';

function CenterDetailsForm({
  settings,
}: Readonly<{ settings: CenterSettingsResponseDto }>): React.JSX.Element {
  const router = useRouter();
  const { control, handleSubmit } = useForm<CenterDetailsFormValues>({
    resolver: zodResolver(centerDetailsFormSchema),
    defaultValues: mapSettingsToDetailsForm(settings),
  });
  // La versión se lee del servidor en cada pintado: si cambia un cierre, el guardado usa la nueva.
  const { saveSettings, isSaving, saveErrorMessage } = useSaveCenterSettings(settings.version);

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.details.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.details.saveAction')}
          onPress={() => {
            void handleSubmit((formValues) => {
              saveSettings(buildDetailsPatch(formValues), router.back);
            })();
          }}
        />
      }
    >
      <SectorChoiceField control={control} />
      <ContactFields control={control} />
      <FiscalFields control={control} />
      <OpeningHoursSection openingHours={settings.openingHours} />
      <HolidaysSection holidays={settings.holidays} settingsVersion={settings.version} />
      <TimeZoneChoiceField control={control} />
      {saveErrorMessage === null ? null : <FormErrorBanner message={saveErrorMessage} />}
    </ScreenTemplate>
  );
}

/** Prototipo `acenter`, «Datos del centro y horario»: tipo, contacto, fiscales, horario y cierres. */
export function CenterDetailsScreen(): React.JSX.Element {
  const router = useRouter();
  const settings = useCenterSettings();

  if (settings.data !== undefined) return <CenterDetailsForm settings={settings.data} />;
  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.details.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {settings.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.details.errorTitle')}
          error={settings.error}
          onRetry={() => void settings.refetch()}
          isRetrying={settings.isFetching}
        />
      ) : (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      )}
    </ScreenTemplate>
  );
}
