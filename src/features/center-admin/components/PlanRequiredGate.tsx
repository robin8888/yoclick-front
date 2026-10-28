import { usePathname, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { BlockingModal } from '@/ui/organisms/BlockingModal';

import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { useRefreshSubscriptionOnReturn } from '../hooks/useRefreshSubscriptionOnReturn';

const PLANS_ROUTE = '/(admin)/subscription/plans';
const SUBSCRIPTION_PATH_PREFIX = '/subscription';

/**
 * Cuando la prueba gratuita acaba sin plan (o el pago falla y la gracia se agota) tapa la app con un
 * aviso que no se puede cerrar. Explica que el enlace de pago le llega por correo (la app no cobra ni
 * enlaza a pagos: reglas de las tiendas) y deja ver los planes. No sale en las pantallas de suscripción.
 * La API también lo impide: esto es solo la explicación.
 */
export function PlanRequiredGate(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const subscription = useCenterSubscription();
  // El pago se hace fuera de la app: al volver a ella se comprueba si ya está pagado.
  useRefreshSubscriptionOnReturn();

  const isViewingPlans = pathname.startsWith(SUBSCRIPTION_PATH_PREFIX);
  const isBlocked = subscription.data?.isPlanRequired === true && !isViewingPlans;
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
