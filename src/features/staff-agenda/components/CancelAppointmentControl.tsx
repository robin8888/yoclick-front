import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import { CancelAppointmentSheet } from './CancelAppointmentSheet';

interface CancelAppointmentControlProps {
  clientName: string;
  isCancelling: boolean;
  /** Cancela la cita en el servidor y avisa cuando ya está cancelada. */
  onCancel: (onCancelled: () => void) => void;
}

/** «Cancelar cita» con su confirmación: el cliente recibe un aviso en el móvil. */
export function CancelAppointmentControl({
  clientName,
  isCancelling,
  onCancel,
}: Readonly<CancelAppointmentControlProps>): React.JSX.Element {
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        isFullWidth
        label={i18n.t('staffAgenda.session.cancelAction')}
        onPress={() => {
          setIsSheetVisible(true);
        }}
      />
      <CancelAppointmentSheet
        isVisible={isSheetVisible}
        isCancelling={isCancelling}
        clientName={clientName}
        onConfirm={() => {
          onCancel(() => {
            setIsSheetVisible(false);
          });
        }}
        onDismiss={() => {
          setIsSheetVisible(false);
        }}
      />
    </>
  );
}
