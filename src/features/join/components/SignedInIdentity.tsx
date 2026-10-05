import { View } from 'react-native';

import { platformCardColors, useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { useSignedInIdentity } from '../hooks/useSignedInIdentity';
import { IDENTITY_STYLE } from './SignedInIdentity.styles';

interface SignedInIdentityProps {
  /** `platform`: dorado sobre el fondo de Yoclick; `center`: con el color del centro. */
  tone: 'platform' | 'center';
}

/** Rol y nombre de quien ha entrado, bajo el logotipo o el avatar. Sin sesión no se muestra. */
export function SignedInIdentity({
  tone,
}: Readonly<SignedInIdentityProps>): React.JSX.Element | null {
  const identity = useSignedInIdentity();
  const theme = useTheme();
  const textColor = tone === 'platform' ? platformCardColors.selectedBorder : theme.colors.brandInk;

  if (identity === null) return null;
  return (
    <View style={IDENTITY_STYLE}>
      <Text variant="overline" align="center" tintColor={textColor}>
        {identity.roleLabel}
      </Text>
      {identity.fullName === null ? null : (
        <Text variant="titleMd" align="center" tintColor={textColor}>
          {identity.fullName}
        </Text>
      )}
    </View>
  );
}
