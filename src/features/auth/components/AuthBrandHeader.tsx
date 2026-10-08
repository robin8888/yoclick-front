import { View } from 'react-native';

import { useInvitedCenterPreview } from '@/features/join';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { Avatar } from '@/ui/atoms/Avatar';
import { Logo } from '@/ui/atoms/Logo';
import { Text } from '@/ui/atoms/Text';

const CENTER_HEADER_STYLE = { alignItems: 'center', gap: 8 } as const;

interface AuthBrandHeaderProps {
  /** Alto del logotipo de Yoclick cuando no hay centro que invite. */
  platformLogoHeight: number;
}

/**
 * Cabecera de las pantallas de acceso: el logo del centro que invita si la persona trae un código
 * o enlace; si no, el logotipo de Yoclick.
 */
export function AuthBrandHeader({
  platformLogoHeight,
}: Readonly<AuthBrandHeaderProps>): React.JSX.Element {
  const invitedCenter = useInvitedCenterPreview()?.center;
  if (invitedCenter === undefined) return <Logo variant="lockup" height={platformLogoHeight} />;

  return (
    <View style={CENTER_HEADER_STYLE}>
      <Avatar
        name={invitedCenter.name}
        photoUrl={resolveApiAssetUrl(invitedCenter.logoUrl)}
        size="xl"
        isDecorative
      />
      <Text variant="titleMd" align="center">
        {invitedCenter.name}
      </Text>
    </View>
  );
}

/** Las pantallas de acceso llevan el degradado de Yoclick salvo que las vista un centro. */
export function useHasPlatformLook(): boolean {
  return useInvitedCenterPreview() === undefined;
}
