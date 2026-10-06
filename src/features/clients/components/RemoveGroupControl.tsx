import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

interface RemoveGroupControlProps {
  groupName: string;
  isRemoving: boolean;
  onRemoveConfirm: () => void;
}

/** «Quitar grupo» con confirmación: sus miembros se quedan sin grupo. */
export function RemoveGroupControl({
  groupName,
  isRemoving,
  onRemoveConfirm,
}: Readonly<RemoveGroupControlProps>): React.JSX.Element {
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  return (
    <>
      <Button
        variant="danger"
        leadingIconName="trash"
        label={i18n.t('clients.groupDetail.removeAction')}
        onPress={() => {
          setIsSheetVisible(true);
        }}
      />
      <ConfirmSheet
        isVisible={isSheetVisible}
        title={i18n.t('clients.groupDetail.removeTitle')}
        message={i18n.t('clients.groupDetail.removeMessage', { name: groupName })}
        confirmLabel={i18n.t('clients.groupDetail.removeConfirm')}
        dismissLabel={i18n.t('actions.cancel')}
        isConfirming={isRemoving}
        isDestructive
        onConfirm={onRemoveConfirm}
        onDismiss={() => {
          setIsSheetVisible(false);
        }}
      />
    </>
  );
}
