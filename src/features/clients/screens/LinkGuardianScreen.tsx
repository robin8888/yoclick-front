import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';

import { i18n } from '@/shared/i18n';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClientPicker } from '../components/ClientPicker';
import { useGuardianLinking } from '../hooks/useGuardians';

const ROUTE_PARAMS_SCHEMA = z.object({ childMembershipId: z.uuid() });

function LinkGuardianContent({
  childMembershipId,
}: Readonly<{ childMembershipId: string }>): React.JSX.Element {
  const router = useRouter();
  const linking = useGuardianLinking(childMembershipId);

  return (
    <ScreenTemplate
      title={i18n.t('clients.guardians.linkTitle')}
      subtitle={i18n.t('clients.guardians.linkSubtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={linking.isBusy}
    >
      {linking.errorMessage === null ? null : <FormErrorBanner message={linking.errorMessage} />}
      <ClientPicker
        onClientSelect={(client) => {
          linking.link(client.membershipId, router.back);
        }}
      />
    </ScreenTemplate>
  );
}

/** Elegir, entre las personas del centro, quién es el tutor del menor de la ficha. */
export function LinkGuardianScreen(): React.JSX.Element {
  const parsed = ROUTE_PARAMS_SCHEMA.safeParse(useLocalSearchParams());
  if (!parsed.success) return <Redirect href="/(admin)/(tabs)/clients" />;
  return <LinkGuardianContent childMembershipId={parsed.data.childMembershipId} />;
}
