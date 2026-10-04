import type { Ref } from 'react';
import type { TextInput, TextInputProps } from 'react-native';

import type { IconName } from '../Icon';

interface BaseInputProps {
  value: string;
  onChangeText: (nextText: string) => void;
  /** Obligatoria: el placeholder desaparece al escribir y no es una etiqueta accesible. */
  accessibilityLabel: string;
  placeholder?: string;
  /** Con error el borde se vuelve `danger` y aparece un icono: el error no depende solo del color. */
  isInvalid?: boolean;
  /** Texto del icono de error para lectores de pantalla (p. ej. «Hay un error en este campo»). */
  invalidAccessibilityLabel?: string;
  isDisabled?: boolean;
  leadingIconName?: IconName;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  maxLength?: number;
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: Ref<TextInput>;
}

interface PlainInputProps extends BaseInputProps {
  isSecure?: false;
}

/** Los campos de contraseña obligan a dar los dos textos del botón «mostrar / ocultar». */
interface SecureInputProps extends BaseInputProps {
  isSecure: true;
  showSecureTextLabel: string;
  hideSecureTextLabel: string;
}

export type InputProps = PlainInputProps | SecureInputProps;
