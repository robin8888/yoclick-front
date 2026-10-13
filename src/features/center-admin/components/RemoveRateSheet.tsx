import type { RateListResponseDtoRatesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import { useArchiveRate } from '../hooks/useArchiveRate';

interface RemoveRateSheetProps {
  /** El bono que se quiere quitar; `null` mantiene la hoja cerrada. */
  rate: RateListResponseDtoRatesItem | null;
  onClose: () => void;
}

/** Confirmación de «Quitar bono»: los ya vendidos siguen valiendo. */
export function RemoveRateSheet({
  rate,
  onClose,
}: Readonly<RemoveRateSheetProps>): React.JSX.Element {
  const archive = useArchiveRate();

  return (
    <>
      {archive.errorMessage === null ? null : <FormErrorBanner message={archive.errorMessage} />}
      <ConfirmSheet
        isVisible={rate !== null}
        title={i18n.t('centerAdmin.passes.removeTitle')}
        message={i18n.t('centerAdmin.passes.removeMessage', { name: rate?.name ?? '' })}
        confirmLabel={i18n.t('centerAdmin.passes.removeConfirm')}
        dismissLabel={i18n.t('actions.cancel')}
        isConfirming={archive.isArchiving}
        isDestructive
        onConfirm={() => {
          if (rate !== null) archive.archiveRate(rate.id, onClose);
        }}
        onDismiss={onClose}
      />
    </>
  );
}
