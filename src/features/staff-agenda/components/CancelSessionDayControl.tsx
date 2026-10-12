import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { useCancelSessionDay } from '../hooks/useCancelSessionDay';

interface CancelSessionDaySheetProps {
  sessionId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface CancelSessionDayButtonsProps {
  isReasonMissing: boolean;
  isCancelling: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

function CancelSessionDayButtons({
  isReasonMissing,
  isCancelling,
  onConfirm,
  onDismiss,
}: Readonly<CancelSessionDayButtonsProps>): React.JSX.Element {
  return (
    <>
      <Button
        isFullWidth
        variant="danger"
        label={i18n.t('staffAgenda.rooms.cancelDayConfirm')}
        isDisabled={isReasonMissing}
        isLoading={isCancelling}
        onPress={onConfirm}
      />
      <Button
        isFullWidth
        variant="ghost"
        label={i18n.t('staffAgenda.rooms.cancelDayDismiss')}
        onPress={onDismiss}
      />
    </>
  );
}

/** El motivo (obligatorio, lo leen las personas afectadas) y la confirmación. */
function CancelSessionDaySheet({
  sessionId,
  isVisible,
  onClose,
}: Readonly<CancelSessionDaySheetProps>): React.JSX.Element {
  const [reason, setReason] = useState('');
  const cancellation = useCancelSessionDay(sessionId);

  return (
    <BottomSheet
      isVisible={isVisible}
      title={i18n.t('staffAgenda.rooms.cancelDayTitle')}
      onDismiss={onClose}
    >
      <Text color="ink2">{i18n.t('staffAgenda.rooms.cancelDayHelper')}</Text>
      <Input
        value={reason}
        onChangeText={setReason}
        accessibilityLabel={i18n.t('staffAgenda.rooms.cancelDayReasonLabel')}
        placeholder={i18n.t('staffAgenda.rooms.cancelDayReasonPlaceholder')}
      />
      {cancellation.errorMessage === null ? null : (
        <FormErrorBanner message={cancellation.errorMessage} />
      )}
      <CancelSessionDayButtons
        isReasonMissing={reason.trim() === ''}
        isCancelling={cancellation.isCancelling}
        onConfirm={() => {
          cancellation.cancelSessionDay(reason.trim(), onClose);
        }}
        onDismiss={onClose}
      />
    </BottomSheet>
  );
}

/** «Cancelar este día»: solo esa sesión; el horario sigue los demás días. */
export function CancelSessionDayControl({
  sessionId,
}: Readonly<{ sessionId: string }>): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        isFullWidth
        variant="ghostDanger"
        label={i18n.t('staffAgenda.rooms.cancelDayAction')}
        onPress={() => {
          setIsOpen(true);
        }}
      />
      <CancelSessionDaySheet
        sessionId={sessionId}
        isVisible={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
}
