import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { i18n } from '@/shared/i18n';
import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { useCenterSubscription } from '../hooks/useCenterSubscription';
import { countClientsOverLimit } from '../model/subscription-plan';
import { createBannerStyle } from './OverLimitBanner.styles';

const SUBSCRIPTION_ROUTE = '/(admin)/subscription';

function OverLimitBannerBody({ excess }: Readonly<{ excess: number }>): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();
  const style = usePressableStyle({
    baseStyle: createBannerStyle(theme),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });
  const title = i18n.t('centerAdmin.subscription.overLimitBannerTitle');
  const message = i18n.t('centerAdmin.subscription.overLimitBannerMessage', { excess });

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${title}. ${message}`}
      onPress={() => {
        router.push(SUBSCRIPTION_ROUTE);
      }}
      style={style}
    >
      <Text variant="bodyStrong" color="warning">
        {title}
      </Text>
      <Text variant="caption" color="ink2">
        {message}
      </Text>
    </Pressable>
  );
}

/**
 * Aviso en el inicio del centro cuando hay más clientes activos que el tope del plan (por ejemplo, tras
 * bajar de plan). Nadie pierde el acceso: solo se frenan las altas nuevas. Sin tope o sin exceso, no ocupa sitio.
 */
export function OverLimitBanner(): React.JSX.Element | null {
  const subscription = useCenterSubscription();
  if (subscription.data === undefined) return null;

  const excess = countClientsOverLimit(
    subscription.data.activeClientCount,
    subscription.data.maxClients,
  );
  return excess === 0 ? null : <OverLimitBannerBody excess={excess} />;
}
