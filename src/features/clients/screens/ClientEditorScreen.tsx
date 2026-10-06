import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClientEditorFields } from '../components/ClientEditorFields';
import { useClientEditor } from '../hooks/useClientEditor';
import { parseClientRouteParams } from '../model/client-route-params';

interface ClientEditorContentProps {
  membershipId: string;
}

function ClientEditorContent({
  membershipId,
}: Readonly<ClientEditorContentProps>): React.JSX.Element {
  const router = useRouter();
  const editor = useClientEditor(membershipId);

  return (
    <ScreenTemplate
      title={editor.client?.fullName ?? i18n.t('clients.clientEditor.title')}
      subtitle={editor.client?.email}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={editor.isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t('clients.clientEditor.saveAction')}
          isDisabled={!editor.hasChanges}
          onPress={editor.save}
        />
      }
    >
      <ClientEditorFields
        client={editor.client}
        groups={editor.groups}
        levelChoice={editor.levelChoice}
        groupChoice={editor.groupChoice}
        onLevelChoose={editor.chooseLevel}
        onGroupChoose={editor.chooseGroup}
      />
      {editor.errorMessage === null ? null : <FormErrorBanner message={editor.errorMessage} />}
    </ScreenTemplate>
  );
}

/** Ficha de un cliente (`acfile`): su nivel y su grupo. */
export function ClientEditorScreen(): React.JSX.Element {
  const routeParams = parseClientRouteParams(useLocalSearchParams());
  if (routeParams === null) return <Redirect href="/(admin)/(tabs)/clients" />;
  return <ClientEditorContent membershipId={routeParams.membershipId} />;
}
