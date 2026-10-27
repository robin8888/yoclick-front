import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { Button } from '@/ui/atoms/Button';
import { ProblemModal } from '@/ui/organisms/ProblemModal';

import { useOpenSubscriptionPortal } from '../hooks/useOpenSubscriptionPortal';

/** Para quien ya paga: lleva al portal de Stripe a cambiar de plan, de tarjeta, ver facturas o cancelar. */
export function ManageSubscriptionButton(): React.JSX.Element {
  const portal = useOpenSubscriptionPortal();

  return (
    <>
      <Button
        variant="outline"
        label={i18n.t('centerAdmin.subscription.manageAction')}
        isFullWidth
        isLoading={portal.isOpening}
        onPress={portal.openPortal}
      />
      <ProblemModal
        message={portal.portalErrorMessage}
        onDismiss={portal.clearError}
        {...getProblemModalCopy()}
      />
    </>
  );
}
