import { Image } from 'expo-image';
import { View } from 'react-native';

import { PhotoDropTile, PhotoSourceSheet, usePhotoPicking } from '@/features/photos';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useAddProfilePhoto, useRemoveProfilePhoto } from '../hooks/useTeamProfileMutations';
import { ProfileSection } from './ProfileSection';
import {
  createGalleryPhotoStyle,
  GALLERY_CELL_STYLE,
  GALLERY_GRID_STYLE,
} from './TeamProfiles.styles';

const MAX_GALLERY_PHOTOS = 6;

type GalleryPhoto = ProfileResponseDto['photos'][number];

function GalleryPhotoCell({
  photo,
  position,
  isRemoving,
  onRemove,
}: Readonly<{
  photo: GalleryPhoto;
  position: number;
  isRemoving: boolean;
  onRemove: (photoId: string) => void;
}>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={GALLERY_CELL_STYLE}>
      <Image
        source={{ uri: photo.url }}
        style={createGalleryPhotoStyle(theme)}
        contentFit="cover"
        accessibilityLabel={i18n.t('teamProfiles.editor.photoLabel', { position })}
      />
      <Button
        size="sm"
        variant="ghostDanger"
        label={i18n.t('teamProfiles.editor.removePhotoAction')}
        accessibilityLabel={i18n.t('teamProfiles.editor.removePhotoLabel', { position })}
        isDisabled={isRemoving}
        onPress={() => {
          onRemove(photo.id);
        }}
      />
    </View>
  );
}

function GalleryGrid({
  photos,
  isBusy,
  onPhotoRemove,
  onAddPress,
}: Readonly<{
  photos: ProfileResponseDto['photos'];
  isBusy: boolean;
  onPhotoRemove: (photoId: string) => void;
  onAddPress: () => void;
}>): React.JSX.Element {
  return (
    <View style={GALLERY_GRID_STYLE}>
      {photos.map((photo, index) => (
        <GalleryPhotoCell
          key={photo.id}
          photo={photo}
          position={index + 1}
          isRemoving={isBusy}
          onRemove={onPhotoRemove}
        />
      ))}
      {photos.length < MAX_GALLERY_PHOTOS ? (
        <View style={GALLERY_CELL_STYLE}>
          <PhotoDropTile
            title={i18n.t('teamProfiles.editor.addPhotoAction')}
            isDisabled={isBusy}
            onPress={onAddPress}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Las fotos del perfil, de dos en dos, con el recuadro de rayas «Añadir foto» mientras quepan más. */
export function ProfilePhotosSection({
  profile,
}: Readonly<{ profile: ProfileResponseDto }>): React.JSX.Element {
  const addition = useAddProfilePhoto();
  const removal = useRemoveProfilePhoto();
  const picking = usePhotoPicking({
    shape: 'free',
    onPhoto: (photo) => {
      addition.run(photo);
    },
  });
  const errorMessage = picking.problemMessage ?? addition.errorMessage ?? removal.errorMessage;

  return (
    <ProfileSection
      title={i18n.t('teamProfiles.editor.photosTitle', { count: profile.photos.length })}
      description={i18n.t('teamProfiles.editor.photosHint')}
    >
      <GalleryGrid
        photos={profile.photos}
        isBusy={addition.isRunning || removal.isRunning || picking.isPreparing}
        onPhotoRemove={(photoId) => {
          removal.run(photoId);
        }}
        onAddPress={picking.openSheet}
      />
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <PhotoSourceSheet picking={picking} title={i18n.t('teamProfiles.editor.addPhotoAction')} />
    </ProfileSection>
  );
}
