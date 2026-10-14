import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

interface DeleteEntrySectionProps {
  isDeleting: boolean;
  isDisabled: boolean;
  onConfirmPress: () => void;
}

interface ConfirmDeleteProps extends DeleteEntrySectionProps {
  onKeepPress: () => void;
}

function ConfirmDelete({
  isDeleting,
  isDisabled,
  onKeepPress,
  onConfirmPress,
}: Readonly<ConfirmDeleteProps>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong">{i18n.t('timeClock.deleteConfirm.title')}</Text>
      <Text color="ink2">{i18n.t('timeClock.deleteConfirm.message')}</Text>
      <Button
        variant="danger"
        label={i18n.t('timeClock.deleteConfirm.confirm')}
        isFullWidth
        isLoading={isDeleting}
        isDisabled={isDisabled}
        onPress={onConfirmPress}
      />
      <Button
        variant="ghost"
        label={i18n.t('actions.cancel')}
        isFullWidth
        isDisabled={isDisabled}
        onPress={onKeepPress}
      />
    </>
  );
}

/** Eliminar pide confirmación en la propia hoja: quita el fichaje del informe del mes. */
export function DeleteEntrySection(props: Readonly<DeleteEntrySectionProps>): React.JSX.Element {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <ConfirmDelete
        {...props}
        onKeepPress={() => {
          setIsConfirming(false);
        }}
      />
    );
  }
  return (
    <Button
      variant="outline"
      label={i18n.t('timeClock.editor.deleteAction')}
      leadingIconName="trash"
      isFullWidth
      isDisabled={props.isDisabled}
      onPress={() => {
        setIsConfirming(true);
      }}
    />
  );
}
