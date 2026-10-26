import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { ProblemModal } from '@/ui/organisms/ProblemModal';

import type { BookingFailure } from '../model/pass-needed';
import { PassNeededSheet } from './PassNeededSheet';

interface BookingFailureModalsProps extends BookingFailure {
  onDismiss: () => void;
}

/** Lo que se enseña cuando el servidor no deja reservar: pedir el bono, o el motivo del rechazo. */
export function BookingFailureModals({
  createErrorMessage,
  isPassNeeded,
  onDismiss,
}: Readonly<BookingFailureModalsProps>): React.JSX.Element {
  return (
    <>
      <PassNeededSheet isVisible={isPassNeeded} onDismiss={onDismiss} />
      <ProblemModal message={createErrorMessage} onDismiss={onDismiss} {...getProblemModalCopy()} />
    </>
  );
}
