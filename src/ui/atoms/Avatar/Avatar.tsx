import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Text } from '../Text';
import {
  AVATAR_INITIALS_VARIANTS,
  createAvatarImageStyle,
  createAvatarStyle,
} from './Avatar.styles';
import type { AvatarProps } from './Avatar.types';
import { getInitials } from './get-initials';

export function Avatar({
  name,
  photoUrl,
  size = 'md',
  isDecorative = false,
}: Readonly<AvatarProps>): React.JSX.Element {
  const theme = useTheme();
  const [hasPhotoFailed, setHasPhotoFailed] = useState(false);
  const shouldShowPhoto = typeof photoUrl === 'string' && photoUrl !== '' && !hasPhotoFailed;

  return (
    <View
      accessible={!isDecorative}
      role={isDecorative ? undefined : 'img'}
      aria-label={isDecorative ? undefined : name}
      aria-hidden={isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'auto'}
      style={createAvatarStyle(theme, size)}
    >
      {shouldShowPhoto ? (
        <Image
          source={{ uri: photoUrl }}
          style={createAvatarImageStyle(size)}
          contentFit="cover"
          accessible={false}
          onError={() => {
            setHasPhotoFailed(true);
          }}
        />
      ) : (
        <Text variant={AVATAR_INITIALS_VARIANTS[size]}>{getInitials(name)}</Text>
      )}
    </View>
  );
}
