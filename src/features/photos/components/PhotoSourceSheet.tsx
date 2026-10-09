import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import type { PhotoPicking } from '../hooks/usePhotoPicking';

function SourceButtons({ picking }: Readonly<{ picking: PhotoPicking }>): React.JSX.Element {
  return (
    <>
      <Button
        leadingIconName="camera"
        label={i18n.t('photos.sheet.takeAction')}
        isFullWidth
        onPress={() => {
          picking.choose('camera');
        }}
      />
      <Button
        variant="secondary"
        leadingIconName="image"
        label={i18n.t('photos.sheet.libraryAction')}
        isFullWidth
        onPress={() => {
          picking.choose('library');
        }}
      />
    </>
  );
}

/** «Hacer foto», «Elegir de la galería» y, si ya hay una, «Quitar foto». */
export function PhotoSourceSheet({
  picking,
  title,
}: Readonly<{ picking: PhotoPicking; title: string }>): React.JSX.Element {
  return (
    <BottomSheet
      isVisible={picking.isSheetVisible}
      title={title}
      onDismiss={picking.closeSheet}
      onClosed={picking.handleSheetClosed}
    >
      <SourceButtons picking={picking} />
      {picking.canRemove ? (
        <Button
          variant="ghostDanger"
          label={i18n.t('photos.sheet.removeAction')}
          isFullWidth
          onPress={picking.remove}
        />
      ) : null}
      <Button
        variant="ghost"
        label={i18n.t('actions.cancel')}
        isFullWidth
        onPress={picking.closeSheet}
      />
    </BottomSheet>
  );
}
