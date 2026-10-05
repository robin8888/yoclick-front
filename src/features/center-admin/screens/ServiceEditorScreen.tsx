import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ServiceEditorFields } from '../components/ServiceEditorFields';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useServiceEditorForm } from '../hooks/useServiceEditorForm';
import { parseServiceRouteParams } from '../model/service-route-params';

/** Prototipo `asvcedit`: crear o editar un servicio; «se publica al guardar». */
export function ServiceEditorScreen(): React.JSX.Element {
  const router = useRouter();
  const routeParams = parseServiceRouteParams(useLocalSearchParams());
  const catalog = useServiceCatalog();
  const editedService = catalog.data?.services.find(
    (catalogService) => catalogService.id === routeParams?.serviceId,
  );
  const form = useServiceEditorForm(editedService);

  if (routeParams === null) return <Redirect href="/(admin)/services" />;
  const isNewService = routeParams.serviceId === 'new';

  return (
    <ScreenTemplate
      title={i18n.t(
        isNewService ? 'centerAdmin.serviceEditor.newTitle' : 'centerAdmin.serviceEditor.editTitle',
      )}
      subtitle={i18n.t('centerAdmin.serviceEditor.publishedOnSave')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={form.isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.serviceEditor.saveAction')}
          onPress={form.submitService}
        />
      }
    >
      <ServiceEditorFields form={form} />
      {form.saveErrorMessage === null ? null : <FormErrorBanner message={form.saveErrorMessage} />}
      {editedService === undefined ? null : (
        <Button
          variant="danger"
          leadingIconName="trash"
          label={i18n.t('centerAdmin.serviceEditor.archiveAction')}
          onPress={form.archiveService}
        />
      )}
    </ScreenTemplate>
  );
}
