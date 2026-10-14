import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { MyPassCard } from '../components/MyPassCard';
import { MyRentalsSection } from '../components/MyRentalsSection';
import { PayPassAction } from '../components/PayPassAction';
import { RateOfferCard } from '../components/RateOfferCard';
import { useMyPasses } from '../hooks/useMyPasses';
import { usePaymentsStatus } from '../hooks/usePaymentsStatus';
import { useRateOffers } from '../hooks/useRateOffers';
import { useRequestPass } from '../hooks/useRequestPass';

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
      {myPasses.map((pass) => (
        <MyPassCard
          key={pass.id}
          pass={pass}
          actions={canPayOnline && pass.status === 'pending' ? <PayPassAction pass={pass} /> : null}
        />
      ))}
      <MyRentalsSection />
      <RateOffersSection />
    </ScreenTemplate>
  );
}
