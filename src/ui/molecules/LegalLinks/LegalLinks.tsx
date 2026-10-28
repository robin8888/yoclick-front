import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createLegalLinksRowStyle, LEGAL_LINK_STYLE } from './LegalLinks.styles';
import type { LegalLinksProps } from './LegalLinks.types';

/** Enlaces a los textos legales (política de privacidad, condiciones), en una fila que baja si no caben. */
export function LegalLinks({ links, errorMessage }: Readonly<LegalLinksProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View>
      <View style={createLegalLinksRowStyle(theme)}>
        {links.map((link) => (
          <Pressable
            key={link.label}
            role="link"
            accessibilityLabel={link.accessibilityLabel ?? link.label}
            onPress={link.onPress}
            style={LEGAL_LINK_STYLE}
          >
            <Text variant="bodyStrong" color="brandInk">
              {link.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errorMessage === undefined ? null : (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
