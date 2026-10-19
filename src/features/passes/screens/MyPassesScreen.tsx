import { useRouter } from 'expo-router';

import { ActingForSelector } from '@/features/guardians';
import { LoadErrorState } from '@/features/join';
import { MyReceiptsSection } from '@/features/receipts';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { MyPassCard } from '../components/MyPassCard';
import { PayPassAction } from '../components/PayPassAction';
import { RateOfferCard } from '../components/RateOfferCard';
import { useMyPasses } from '../hooks/useMyPasses';
import { usePaymentsStatus } from '../hooks/usePaymentsStatus';
import { useRateOffers } from '../hooks/useRateOffers';
import { useRequestPass } from '../hooks/useRequestPass';
import { pickHomePass } from '../model/pass-summary';

function RateOffersSection(): React.JSX.Element {
  const offers = useRateOffers();
  const request = useRequestPass();
  const rates = offers.data?.rates ?? [];

  return (
    <>
      <Text variant="titleMd" role="heading">
        {i18n.t('passes.offersTitle')}
      </Text>
      {request.errorMessage === null ? null : <FormErrorBanner message={request.errorMessage} />}
      {offers.isSuccess && rates.length === 0 ? (
        <Text color="ink2">{i18n.t('passes.noOffers')}</Text>
      ) : null}
      {rates.map((rate) => (
        <RateOfferCard
          key={rate.id}
          rate={rate}
          isBusy={request.isRequesting}
          onRequestPress={() => {
            request.requestPass(rate.id);
          }}
        />
      ))}
      {rates.length > 0 ? (
        <Text variant="caption" color="ink2">
          {i18n.t('passes.requestHint')}
        </Text>
      ) : null}
    </>
  );
}

type MyPass = ReturnType<typeof useMyPasses>['data'] extends infer Data
  ? Data extends { passes: readonly (infer Item)[] }
    ? Item
    : never
  : never;

/** El bono actual (el que sale en el inicio) arriba y, debajo, los demás. */
function MyPassList({
  passes,
  canPayOnline,
}: Readonly<{ passes: readonly MyPass[]; canPayOnline: boolean }>): React.JSX.Element {
  const currentPass = pickHomePass(passes);
  const otherPasses = passes.filter(({ id }) => id !== currentPass?.id);
  const renderPass = (pass: MyPass): React.JSX.Element => (
    <MyPassCard
      key={pass.id}
      pass={pass}
      actions={canPayOnline && pass.status === 'pending' ? <PayPassAction pass={pass} /> : null}
    />
  );

  return (
    <>
      {currentPass === null ? null : (
        <>
          <Text variant="titleMd" role="heading">
            {i18n.t('passes.currentTitle')}
          </Text>
          {renderPass(currentPass)}
        </>
      )}
      {otherPasses.length === 0 ? null : (
        <>
          <Text variant="titleMd" role="heading">
            {i18n.t('passes.othersTitle')}
          </Text>
          {otherPasses.map(renderPass)}
        </>
      )}
    </>
  );
}

/** Prototipo `wallet`: mis bonos (clases que quedan y caducidad) y los que puedo pedir. */
export function MyPassesScreen(): React.JSX.Element {
  const router = useRouter();
  const passes = useMyPasses();
  const myPasses = (passes.data?.passes ?? []).filter(({ status }) => status !== 'rejected');
  const canPayOnline = usePaymentsStatus() === 'ready';
  return (
    <ScreenTemplate
      title={i18n.t('passes.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <ActingForSelector />
      {passes.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {passes.isError ? (
        <LoadErrorState
          title={i18n.t('passes.loadError')}
          error={passes.error}
          onRetry={() => void passes.refetch()}
          isRetrying={passes.isFetching}
        />
      ) : null}
      {passes.isSuccess && myPasses.length === 0 ? (
        <Text color="ink2">{i18n.t('passes.empty')}</Text>
      ) : null}
      <MyPassList passes={myPasses} canPayOnline={canPayOnline} />
      <RateOffersSection />
      <MyReceiptsSection />
    </ScreenTemplate>
  );
}
