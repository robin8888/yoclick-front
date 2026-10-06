import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

interface RemoveTeamMemberControlProps {
  memberName: string;
  isRemoving: boolean;
  onRemoveConfirm: () => void;
}

/** «Quitar del equipo» con confirmación: la persona deja de ver el centro y de salir al reservar. */
export function RemoveTeamMemberControl({
  memberName,
  isRemoving,
  onRemoveConfirm,
}: Readonly<RemoveTeamMemberControlProps>): React.JSX.Element {
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  return (
    <>
      <Button
        variant="danger"
        leadingIconName="trash"
        label={i18n.t('centerAdmin.team.removeAction')}
        onPress={() => {
          setIsSheetVisible(true);
        }}
      />
      <ConfirmSheet
        isVisible={isSheetVisible}
        title={i18n.t('centerAdmin.team.removeTitle')}
        message={i18n.t('centerAdmin.team.removeMessage', { name: memberName })}
        confirmLabel={i18n.t('centerAdmin.team.removeConfirm')}
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
