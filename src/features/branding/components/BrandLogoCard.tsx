import { Image } from 'expo-image';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import {
  BRAND_LOGO_IMAGE_STYLE,
  BRAND_LOGO_TEXT_STYLE,
  createBrandLogoCardStyle,
  BRAND_LOGO_ROW_STYLE,
} from './BrandLogoCard.styles';

interface BrandLogoCardProps {
  centerName: string;
  /** Logo publicado. */
  currentLogoUrl: string | null;
  /** Logo recién elegido, aún sin publicar. */
  pendingLogoUri: string | null;
  isPreparing: boolean;
  problemMessage: string | null;
  onLogoPickPress: () => void;
}

function BrandLogoThumbnail({
  centerName,
  currentLogoUrl,
  pendingLogoUri,
}: Readonly<
  Pick<BrandLogoCardProps, 'centerName' | 'currentLogoUrl' | 'pendingLogoUri'>
>): React.JSX.Element {
  if (pendingLogoUri === null) {
    return <Avatar name={centerName} photoUrl={currentLogoUrl} size="xl" />;
  }
  return (
    <Image
      source={{ uri: pendingLogoUri }}
      style={BRAND_LOGO_IMAGE_STYLE}
      accessibilityLabel={i18n.t('branding.logo.newLogoLabel')}
    />
  );
}

function BrandLogoCaption({
  hasPendingLogo,
}: Readonly<{ hasPendingLogo: boolean }>): React.JSX.Element {
  return (
    <View style={BRAND_LOGO_TEXT_STYLE}>
      <Text variant="bodyStrong">{i18n.t('branding.logo.title')}</Text>
      <Text variant="caption" color="ink2">
        {hasPendingLogo ? i18n.t('branding.logo.pendingHelper') : i18n.t('branding.logo.helper')}
      </Text>
    </View>
  );
}

/** Prototipo `abrand`: el logo actual, con «Subir» para sustituirlo al publicar. */
export function BrandLogoCard({
  centerName,
  currentLogoUrl,
  pendingLogoUri,
  isPreparing,
  problemMessage,
  onLogoPickPress,
}: Readonly<BrandLogoCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createBrandLogoCardStyle(theme)}>
      <View style={BRAND_LOGO_ROW_STYLE}>
        <BrandLogoThumbnail
          centerName={centerName}
          currentLogoUrl={currentLogoUrl}
          pendingLogoUri={pendingLogoUri}
        />
        <BrandLogoCaption hasPendingLogo={pendingLogoUri !== null} />
        <Button
          size="sm"
          variant="secondary"
          leadingIconName="camera"
          label={i18n.t('branding.logo.uploadAction')}
          isLoading={isPreparing}
          onPress={onLogoPickPress}
        />
      </View>
      {problemMessage === null ? null : (
        <Text variant="caption" color="danger" role="alert">
          {problemMessage}
        </Text>
      )}
    </View>
  );
}
