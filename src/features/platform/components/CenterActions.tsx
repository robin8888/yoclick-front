import { View } from 'react-native';

import type { PlatformCenterDetailResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';
import { ProblemModal } from '@/ui/organisms/ProblemModal';

import {
  buildActionChanges,
  useCenterActions,
  type CenterActionKind,
} from '../hooks/useCenterActions';
import { CenterPlanPicker } from './CenterPlanPicker';
import { ClientCapForm } from './ClientCapForm';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';
const ACTIONS_STYLE = { gap: 12 } as const;

interface ConfirmCopy {
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive: boolean;
}

/** El texto de la hoja de confirmación de cada acción. Suspender es destructivo; el resto, no. */
function buildConfirmCopy(
  action: CenterActionKind,
  center: PlatformCenterDetailResponseDto,
): ConfirmCopy {
  if (action === 'suspend') {
    return {
      title: i18n.t('platform.center.confirmSuspendTitle'),
      message: i18n.t('platform.center.confirmSuspendMessage', { name: center.name }),
      confirmLabel: i18n.t('platform.center.confirmSuspendAction'),
      isDestructive: true,
    };
  }
  if (action === 'reactivate' || action === 'markActive') {
    return {
      title: i18n.t('platform.center.confirmReactivateTitle'),
      message: i18n.t('platform.center.confirmReactivateMessage', { name: center.name }),
      confirmLabel: i18n.t('platform.center.confirmReactivateAction'),
      isDestructive: false,
    };
  }
  const { trialEndsAt } = buildActionChanges(action, center, new Date());
  return {
    title: i18n.t('platform.center.confirmExtendTitle'),
    message: i18n.t('platform.center.confirmExtendMessage', {
      name: center.name,
      date: formatShortDate(trialEndsAt ?? new Date(), PLATFORM_TIME_ZONE),
    }),
    confirmLabel: i18n.t('platform.center.confirmExtendAction'),
    isDestructive: false,
  };
}

/** Las acciones que se pueden hacer según el estado: suspender o reactivar, y ampliar la prueba. */
function listAvailableActions(
  status: PlatformCenterDetailResponseDto['status'],
): CenterActionKind[] {
  const statusActions: CenterActionKind[] = status === 'suspended' ? ['reactivate'] : ['suspend'];
  if (status === 'trial' || status === 'past_due') statusActions.unshift('markActive');
  return ['extendWeek', 'extendTwoWeeks', ...statusActions];
}

function ActionConfirmSheet({
  center,
  actions,
}: Readonly<{
  center: PlatformCenterDetailResponseDto;
  actions: ReturnType<typeof useCenterActions>;
}>): React.JSX.Element {
  const copy =
    actions.pendingAction === null ? null : buildConfirmCopy(actions.pendingAction, center);

  return (
    <ConfirmSheet
      isVisible={copy !== null}
      title={copy?.title ?? ''}
      message={copy?.message ?? ''}
      confirmLabel={copy?.confirmLabel ?? ''}
      dismissLabel={i18n.t('platform.center.dismiss')}
      isDestructive={copy?.isDestructive ?? false}
      isConfirming={actions.isUpdating}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onConfirm={actions.confirmAction}
      onDismiss={actions.cancelAction}
    />
  );
}

interface CenterActionsProps {
  center: PlatformCenterDetailResponseDto;
}

/** Ampliar la prueba, suspender o reactivar y cambiar el tope. Todo se confirma y queda en la auditoría. */
export function CenterActions({ center }: Readonly<CenterActionsProps>): React.JSX.Element {
  const actions = useCenterActions(center);

  return (
    <View style={ACTIONS_STYLE}>
      <Text variant="titleMd">{i18n.t('platform.center.actionsSection')}</Text>
      {listAvailableActions(center.status).map((action) => (
        <Button
          key={action}
          variant={action === 'suspend' ? 'danger' : 'outline'}
          label={i18n.t(`platform.center.${action}`)}
          onPress={() => {
            actions.requestAction(action);
          }}
        />
      ))}
      <CenterPlanPicker center={center} />
      <ClientCapForm
        currentMaxClients={center.maxClients}
        isSaving={actions.isUpdating}
        onSave={actions.saveClientCap}
      />
      <ActionConfirmSheet center={center} actions={actions} />
      <ProblemModal
        message={actions.updateErrorMessage}
        onDismiss={actions.clearError}
        {...getProblemModalCopy()}
      />
    </View>
  );
}
