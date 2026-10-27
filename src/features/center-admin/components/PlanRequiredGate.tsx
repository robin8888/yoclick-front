import { usePathname, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { BlockingModal } from '@/ui/organisms/BlockingModal';

import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { useRefreshSubscriptionOnReturn } from '../hooks/useRefreshSubscriptionOnReturn';

const PLANS_ROUTE = '/(admin)/subscription/plans';
const SUBSCRIPTION_PATH_PREFIX = '/subscription';

/**
 * Cuando la prueba gratuita acaba sin plan (o el pago falla y la gracia se agota) tapa la app con un
 * aviso que no se puede cerrar: la única salida es elegir un plan. No sale en las pantallas de
 * suscripción, para poder elegirlo y pagarlo. La API también lo impide: esto es solo la explicación.
 */
export function PlanRequiredGate(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const subscription = useCenterSubscription();
  // El pago se hace en el navegador: al volver a la app se comprueba si ya está pagado.
  useRefreshSubscriptionOnReturn();

  const isChoosingPlan = pathname.startsWith(SUBSCRIPTION_PATH_PREFIX);
  const isBlocked = subscription.data?.isPlanRequired === true && !isChoosingPlan;
  const isTrialOver = subscription.data?.status === 'trial';

  return (
    <BlockingModal
      isVisible={isBlocked}
      title={i18n.t(
        isTrialOver
          ? 'centerAdmin.planRequired.trialTitle'
          : 'centerAdmin.planRequired.suspendedTitle',
      )}
      message={i18n.t(
        isTrialOver
          ? 'centerAdmin.planRequired.trialMessage'
          : 'centerAdmin.planRequired.suspendedMessage',
      )}
      actionLabel={i18n.t('centerAdmin.planRequired.action')}
      onActionPress={() => {
        router.push(PLANS_ROUTE);
      }}
    />
  );
}
