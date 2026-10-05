import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useResendCooldown } from '../hooks/useResendCooldown';
import { RESEND_ACTION_STYLE } from './ResendCodeAction.styles';

const RESEND_COOLDOWN_SECONDS = 30;

interface ResendCodeActionProps {
  isResending: boolean;
  onResend: () => void;
}

/** «¿No te ha llegado? Reenviar código», centrado y con cuenta atrás tras cada envío. */
export function ResendCodeAction({
  isResending,
  onResend,
}: Readonly<ResendCodeActionProps>): React.JSX.Element {
  const { secondsLeft, startCooldown } = useResendCooldown(RESEND_COOLDOWN_SECONDS);
  const isCoolingDown = secondsLeft > 0;

  return (
    <View style={RESEND_ACTION_STYLE}>
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('auth.verifyEmail.resendPrompt')}
      </Text>
      <Button
        variant="ghost"
        label={
          isCoolingDown
            ? i18n.t('auth.verifyEmail.resendCooldown', { seconds: secondsLeft })
            : i18n.t('auth.verifyEmail.resendAction')
        }
        isDisabled={isCoolingDown}
        isLoading={isResending}
        onPress={() => {
          onResend();
          startCooldown();
        }}
      />
    </View>
  );
}
