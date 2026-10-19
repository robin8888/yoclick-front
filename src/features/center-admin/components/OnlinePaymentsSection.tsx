import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useOnlinePaymentsSetup } from '../hooks/useOnlinePaymentsSetup';
import { SectionHeader } from './SectionHeader';

const SECTION_STYLE = { gap: 8 } as const;

type SetupProps = Readonly<{ setup: ReturnType<typeof useOnlinePaymentsSetup> }>;

/** Sin razón social, NIF y dirección no hay recibos válidos: se pide antes de activar el cobro. */
function FiscalDataNotice(): React.JSX.Element {
  const router = useRouter();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;

  return (
    <>
      <Text color="warning">
        {i18n.t('centerAdmin.onlinePayments.fiscalDataNotice', { clientWord })}
      </Text>
      <Button
        isFullWidth
        variant="outline"
        leadingIconName="edit"
        label={i18n.t('centerAdmin.onlinePayments.fiscalDataAction')}
        onPress={() => {
          router.push('/(admin)/center');
        }}
      />
    </>
  );
}

/** Alta pendiente: abrir (o retomar) el formulario de Stripe y, al volver, comprobarlo. */
function OnboardingActions({ setup }: SetupProps): React.JSX.Element {
  const isPending = setup.status === 'pending';
  const startKey = isPending
    ? 'centerAdmin.onlinePayments.continueAction'
    : 'centerAdmin.onlinePayments.startAction';

  return (
    <>
      {setup.errorMessage === null ? null : <FormErrorBanner message={setup.errorMessage} />}
      {setup.isFiscalDataComplete ? null : <FiscalDataNotice />}
      <Button
        isFullWidth
        leadingIconName="creditCard"
        isLoading={setup.isBusy}
        isDisabled={!setup.isFiscalDataComplete}
        label={i18n.t(startKey)}
        onPress={setup.startOnboarding}
      />
      {isPending ? (
        <Button
          isFullWidth
          variant="outline"
          leadingIconName="refresh"
          label={i18n.t('centerAdmin.onlinePayments.refreshAction')}
          onPress={setup.refreshStatus}
        />
      ) : null}
    </>
  );
}

/**
 * «Cobros online»: el plan Premium cobra con Stripe y el dinero va a la cuenta del centro; los demás
 * planes siguen validando los bonos a mano.
 */
export function OnlinePaymentsSection(): React.JSX.Element | null {
  const router = useRouter();
  const setup = useOnlinePaymentsSetup();
  if (setup.status === null) return null;
  const isOnboardingNeeded = setup.status === 'not_started' || setup.status === 'pending';

  return (
    <View style={SECTION_STYLE}>
      <SectionHeader title={i18n.t('centerAdmin.onlinePayments.title')} />
      <Text color="ink2">{i18n.t(`centerAdmin.onlinePayments.${setup.status}`)}</Text>
      {isOnboardingNeeded ? <OnboardingActions setup={setup} /> : null}
      {setup.status === 'ready' ? (
        <>
          {setup.errorMessage === null ? null : <FormErrorBanner message={setup.errorMessage} />}
          <Button
            isFullWidth
            variant="outline"
            leadingIconName="creditCard"
            label={i18n.t('centerAdmin.onlinePayments.viewPaymentsAction')}
            onPress={() => {
              router.push('/(admin)/payments');
            }}
          />
          <Button
            isFullWidth
            variant="outline"
            leadingIconName="creditCard"
            isLoading={setup.isBusy}
            label={i18n.t('centerAdmin.onlinePayments.dashboardAction')}
            onPress={setup.openDashboard}
          />
          <Text color="ink2">{i18n.t('centerAdmin.onlinePayments.dashboardHint')}</Text>
        </>
      ) : null}
    </View>
  );
}
