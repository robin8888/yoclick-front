import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useDecidePass } from '../hooks/useDecidePass';
import { usePendingPasses } from '../hooks/usePendingPasses';
import { PendingPassCard } from './PendingPassCard';
import { SectionHeader } from './SectionHeader';

/** Los bonos pedidos y aún sin activar: «Marcar como cobrado» o «Rechazar». Sin pendientes, nada. */
export function PendingPassesSection(): React.JSX.Element | null {
  const pending = usePendingPasses();
  const decision = useDecidePass();
  const passes = pending.data?.passes ?? [];
  if (passes.length === 0) return null;

  return (
    <>
      <SectionHeader title={i18n.t('centerAdmin.passes.pendingTitle')} />
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.passes.pendingHint')}
      </Text>
      {decision.errorMessage === null ? null : <FormErrorBanner message={decision.errorMessage} />}
      {passes.map((pass) => (
        <PendingPassCard
          key={pass.id}
          pass={pass}
          isBusy={decision.isDeciding}
          onActivatePress={() => {
            decision.decidePass({ passId: pass.id, decision: 'activate' });
          }}
          onRejectPress={() => {
            decision.decidePass({ passId: pass.id, decision: 'reject' });
          }}
        />
      ))}
    </>
  );
}
