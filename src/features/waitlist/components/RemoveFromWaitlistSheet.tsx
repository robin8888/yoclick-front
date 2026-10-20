import type { SessionWaitlistResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

interface RemoveFromWaitlistSheetProps {
  /** La persona que se va a quitar; sin ella la hoja está cerrada. */
  person: SessionWaitlistResponseDtoEntriesItem | null;
  isRemoving: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** Quitar a alguien de la espera no se deshace (pierde su puesto), así que se confirma. */
export function RemoveFromWaitlistSheet({
  person,
  isRemoving,
  onConfirm,
  onDismiss,
}: Readonly<RemoveFromWaitlistSheetProps>): React.JSX.Element {
  return (
    <ConfirmSheet
      isVisible={person !== null}
      title={i18n.t('waitlist.removeTitle')}
      message={i18n.t('waitlist.removeMessage', { name: person?.client.fullName ?? '' })}
      confirmLabel={i18n.t('waitlist.removeConfirm')}
      dismissLabel={i18n.t('waitlist.removeDismiss')}
      isDestructive
      isConfirming={isRemoving}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}
