import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  type ImagePickerAsset,
  type ImagePickerOptions,
} from 'expo-image-picker';

import {
  PHOTO_JPEG_QUALITY,
  resolveTargetSize,
  type PhotoShape,
  type PhotoSource,
} from '../model/photo-image';

export type PickPhotoOutcome =
  | { kind: 'photo'; blob: Blob; previewUri: string }
  | { kind: 'cancelled' }
  | { kind: 'camera-denied' };

const SQUARE_ASPECT: [number, number] = [1, 1];

function buildPickerOptions(shape: PhotoShape): ImagePickerOptions {
  return {
    mediaTypes: ['images'],
    allowsEditing: shape === 'square',
    ...(shape === 'square' ? { aspect: SQUARE_ASPECT } : {}),
    quality: 1,
  };
}

async function chooseAsset(
  source: PhotoSource,
  shape: PhotoShape,
): Promise<ImagePickerAsset | 'camera-denied' | null> {
  const options = buildPickerOptions(shape);
  if (source === 'camera') {
    const permission = await requestCameraPermissionsAsync();
    if (!permission.granted) return 'camera-denied';
  }
  const result =
    source === 'camera' ? await launchCameraAsync(options) : await launchImageLibraryAsync(options);
  return result.canceled ? null : (result.assets[0] ?? null);
}

async function shrinkToJpeg(asset: ImagePickerAsset, shape: PhotoShape): Promise<string> {
  const context = ImageManipulator.manipulate(asset.uri);
  context.resize(resolveTargetSize(shape, asset));
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: PHOTO_JPEG_QUALITY });
  return saved.uri;
}

/**
 * Elige una foto (cámara o galería), la reduce y la deja en JPEG lista para subir. La cámara pide
 * permiso en el momento; la galería usa el selector del sistema, que no lo necesita.
 */
export async function pickPreparedPhoto(
  source: PhotoSource,
  shape: PhotoShape,
): Promise<PickPhotoOutcome> {
  const asset = await chooseAsset(source, shape);
  if (asset === 'camera-denied') return { kind: 'camera-denied' };
  if (asset === null) return { kind: 'cancelled' };
  const previewUri = await shrinkToJpeg(asset, shape);
  const blob = await (await fetch(previewUri)).blob();
  return { kind: 'photo', blob, previewUri };
}
