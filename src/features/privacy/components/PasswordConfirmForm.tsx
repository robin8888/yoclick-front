import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { SECTION_STYLE } from './Privacy.styles';

interface PasswordConfirmFormProps {
  /** Texto que explica por qué se pide la contraseña. */
  description: string;
  passwordLabel: string;
  confirmLabel: string;
  isRunning: boolean;
  errorMessage: string | null;
  /** Para acciones que exigen más que la contraseña (escribir una palabra); por defecto basta con ella. */
  isSubmitAllowed?: boolean;
  onSubmit: (password: string) => void;
  children?: React.ReactNode;
}

/** La contraseña otra vez antes de una acción delicada (SEC-12): exportar datos, borrar la cuenta. */
export function PasswordConfirmForm({
  description,
  passwordLabel,
  confirmLabel,
  isRunning,
  errorMessage,
  isSubmitAllowed = true,
  onSubmit,
  children,
}: Readonly<PasswordConfirmFormProps>): React.JSX.Element {
  const [password, setPassword] = useState('');

  return (
    <View style={SECTION_STYLE}>
      <Text color="ink2">{description}</Text>
      <Input
        isSecure
        value={password}
        onChangeText={setPassword}
        accessibilityLabel={passwordLabel}
        placeholder={passwordLabel}
        autoComplete="current-password"
        textContentType="password"
        showSecureTextLabel="Mostrar contraseña"
        hideSecureTextLabel="Ocultar contraseña"
      />
      {children}
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <Button
        label={confirmLabel}
        isLoading={isRunning}
        isDisabled={password === '' || !isSubmitAllowed}
        onPress={() => {
          onSubmit(password);
        }}
      />
    </View>
  );
}
