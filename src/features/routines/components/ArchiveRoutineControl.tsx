import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import { useVisibility } from '../hooks/useVisibility';

interface ArchiveRoutineControlProps {
  routineName: string;
  isArchiving: boolean;
  onArchive: () => void;
}

const CENTERED_STYLE = { alignItems: 'center' } as const;

/** «Archivar» con confirmación: deja de verse para quien la tenía asignada. */
export function ArchiveRoutineControl({
  routineName,
  isArchiving,
  onArchive,
}: Readonly<ArchiveRoutineControlProps>): React.JSX.Element {
  const sheet = useVisibility();

  return (
    <>
      <View style={CENTERED_STYLE}>
        <Button
          variant="primary"
          leadingIconName="trash"
          label={i18n.t('routines.detail.archiveAction')}
          onPress={sheet.show}
        />
      </View>
      <ConfirmSheet
        isVisible={sheet.isVisible}
        title={i18n.t('routines.detail.archiveConfirmTitle')}
        message={i18n.t('routines.detail.archiveConfirmMessage', { name: routineName })}
        confirmLabel={i18n.t('routines.detail.archiveConfirmAction')}
        dismissLabel={i18n.t('routines.detail.keepAction')}
        isConfirming={isArchiving}
        isDestructive
        onConfirm={onArchive}
        onDismiss={sheet.hide}
      />
    </>
  );
}
