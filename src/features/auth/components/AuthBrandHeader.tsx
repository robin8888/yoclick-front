import { View } from 'react-native';

import { useAccessCenter } from '@/features/join';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { Avatar } from '@/ui/atoms/Avatar';
import { Logo } from '@/ui/atoms/Logo';
import { Text } from '@/ui/atoms/Text';

const CENTER_HEADER_STYLE = { alignItems: 'center', gap: 8 } as const;

interface AuthBrandHeaderProps {
  /** Alto del logotipo de Yoclick cuando no hay centro por el que entrar. */
  platformLogoHeight: number;
}

/**
 * Cabecera de las pantallas de acceso: el logo del centro por el que entra la persona (invitación,
 * código o QR); si no hay, el logotipo de Yoclick.
 */
export function AuthBrandHeader({
  platformLogoHeight,
}: Readonly<AuthBrandHeaderProps>): React.JSX.Element {
  const accessCenter = useAccessCenter();
  if (accessCenter === undefined) return <Logo variant="lockup" height={platformLogoHeight} />;

  return (
    <View style={CENTER_HEADER_STYLE}>
      <Avatar
        name={accessCenter.name}
        photoUrl={resolveApiAssetUrl(accessCenter.logoUrl)}
        size="xl"
        isDecorative
      />
      <Text variant="titleMd" align="center">
        {accessCenter.name}
      </Text>
    </View>
  );
}

/** Las pantallas de acceso llevan el degradado de Yoclick salvo que las vista un centro. */
export function useHasPlatformLook(): boolean {
  return useAccessCenter() === undefined;
}
