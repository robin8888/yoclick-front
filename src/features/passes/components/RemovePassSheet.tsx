import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import { useCancelPass } from '../hooks/useCancelPass';

interface RemovePassSheetProps {
  /** El bono que se quiere quitar; `null` mantiene la hoja cerrada. */
  pass: PassListResponseDtoPassesItem | null;
  onClose: () => void;
}

/** Confirmación de «Quitar bono»: deja de salir y de poder usarse; el rastro se conserva. */
export function RemovePassSheet({
  pass,
  onClose,
}: Readonly<RemovePassSheetProps>): React.JSX.Element {
  const cancellation = useCancelPass();

  return (
    <>
      {cancellation.errorMessage === null ? null : (
        <FormErrorBanner message={cancellation.errorMessage} />
      )}
      <ConfirmSheet
        isVisible={pass !== null}
        title={i18n.t('passes.assign.removeTitle')}
        message={i18n.t('passes.assign.removeMessage', { name: pass?.name ?? '' })}
        confirmLabel={i18n.t('passes.assign.removeConfirm')}
        dismissLabel={i18n.t('actions.cancel')}
        isConfirming={cancellation.isCancelling}
        isDestructive
        onConfirm={() => {
          if (pass !== null) cancellation.cancelPass(pass.id, onClose);
        }}
        onDismiss={onClose}
      />
    </>
  );
}
