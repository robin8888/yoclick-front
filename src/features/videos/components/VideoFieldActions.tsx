import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import { WRAP_ROW_STYLE } from './Videos.styles';

interface VideoFieldActionsProps {
  hasVideo: boolean;
  isDisabled: boolean;
  /** Para el lector de pantalla cuando hay varios campos iguales («Añadir vídeo: Sentadilla»). */
  accessibilityName: string | undefined;
  onAddOrChange: () => void;
  onRemove: () => void;
}

/** «Añadir vídeo» (o «Cambiar vídeo» si ya hay uno) y «Quitar vídeo». */
export function VideoFieldActions({
  hasVideo,
  isDisabled,
  accessibilityName,
  onAddOrChange,
  onRemove,
}: Readonly<VideoFieldActionsProps>): React.JSX.Element {
  const withName = (label: string): string =>
    accessibilityName === undefined ? label : `${label}: ${accessibilityName}`;
  const addOrChangeLabel = i18n.t(
    hasVideo ? 'videos.upload.changeAction' : 'videos.upload.addAction',
  );
  const removeLabel = i18n.t('videos.upload.removeAction');

  return (
    <View style={WRAP_ROW_STYLE}>
      <Button
        variant={hasVideo ? 'secondary' : 'outline'}
        size="sm"
        leadingIconName="plus"
        label={addOrChangeLabel}
        accessibilityLabel={withName(addOrChangeLabel)}
        isDisabled={isDisabled}
        onPress={onAddOrChange}
      />
      {hasVideo ? (
        <Button
          variant="ghost"
          size="sm"
          label={removeLabel}
          accessibilityLabel={withName(removeLabel)}
          isDisabled={isDisabled}
          onPress={onRemove}
        />
      ) : null}
    </View>
  );
}
