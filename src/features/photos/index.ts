// API pública de la feature: lo único que otras features pueden importar.
export { MyPhotoAvatar } from './components/MyPhotoAvatar';
export { PhotoDropTile } from './components/PhotoDropTile';
export { PhotoSourceSheet } from './components/PhotoSourceSheet';
export { pickPreparedPhoto, type PickPhotoOutcome } from './hooks/pick-prepared-photo';
export { usePhotoPicking, type PhotoPicking } from './hooks/usePhotoPicking';
