import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Icon } from '@/ui/atoms/Icon';
import { Spinner } from '@/ui/atoms/Spinner';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useMyPhoto } from '../hooks/useMyPhoto';
import { usePhotoPicking } from '../hooks/usePhotoPicking';
import { PhotoSourceSheet } from './PhotoSourceSheet';
import { createPhotoBadgeStyle, CENTERED_STYLE } from './MyPhotoAvatar.styles';

/**
 * Mi foto de perfil con el «+» del prototipo: al tocarla se elige otra o se quita, y vuelve al
 * icono con las iniciales. Sirve igual para el equipo y para el alumnado.
 */
export function MyPhotoAvatar({ name }: Readonly<{ name: string }>): React.JSX.Element {
  const theme = useTheme();
  const photo = useMyPhoto();
  const picking = usePhotoPicking({
    shape: 'square',
    onPhoto: photo.upload,
    onRemove: photo.photoUrl === null ? undefined : photo.remove,
  });
  const isBusy = photo.isBusy || picking.isPreparing;
  const errorMessage = picking.problemMessage ?? photo.errorMessage;
  const label = i18n.t(photo.photoUrl === null ? 'photos.addLabel' : 'photos.changeLabel');

  return (
    <View style={CENTERED_STYLE}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ busy: isBusy }}
        disabled={isBusy}
        onPress={picking.openSheet}
      >
        <Avatar name={name} photoUrl={photo.photoUrl} size="xl" isDecorative />
        <View style={createPhotoBadgeStyle(theme)}>
          {isBusy ? (
            <Spinner color="onBrand" />
          ) : (
            <Icon name="plus" size="inline" color="onBrand" />
          )}
        </View>
      </Pressable>
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('photos.visibilityNote')}
      </Text>
      <PhotoSourceSheet picking={picking} title={i18n.t('photos.sheet.title')} />
    </View>
  );
}
