import { useRef, useState, type RefObject } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  CODE_BOXES_ROW_STYLE,
  CODE_INPUT_OVERLAY_STYLE,
  createCodeBoxStyle,
} from './VerificationCodeBoxes.styles';

export const VERIFICATION_CODE_LENGTH = 6;
const DIGITS_ONLY_PATTERN = /\D/g;

interface CodeBoxRowProps {
  value: string;
  isFocused: boolean;
  isInvalid: boolean;
}

function CodeBoxRow({ value, isFocused, isInvalid }: Readonly<CodeBoxRowProps>): React.JSX.Element {
  const theme = useTheme();
  const activeIndex = Math.min(value.length, VERIFICATION_CODE_LENGTH - 1);

  return (
    <>
      {Array.from({ length: VERIFICATION_CODE_LENGTH }, (_unused, boxIndex) => (
        <View
          key={boxIndex}
          style={createCodeBoxStyle({
            theme,
            isActive: isFocused && boxIndex === activeIndex,
            isInvalid,
          })}
        >
          <Text variant="display" align="center" aria-hidden>
            {value[boxIndex] ?? ''}
          </Text>
        </View>
      ))}
    </>
  );
}

interface VerificationCodeBoxesProps {
  value: string;
  accessibilityLabel: string;
  errorMessage?: string | undefined;
  onValueChange: (code: string) => void;
  onBlur: () => void;
  onSubmitEditing: () => void;
}

function keepOnlyCodeDigits(typedText: string): string {
  return typedText.replace(DIGITS_ONLY_PATTERN, '').slice(0, VERIFICATION_CODE_LENGTH);
}

interface HiddenCodeInputProps {
  inputRef: RefObject<TextInput | null>;
  value: string;
  accessibilityLabel: string;
  onValueChange: (code: string) => void;
  onFocusChange: (isFocused: boolean) => void;
  onBlur: () => void;
  onSubmitEditing: () => void;
}

function HiddenCodeInput({
  inputRef,
  value,
  accessibilityLabel,
  onValueChange,
  onFocusChange,
  onBlur,
  onSubmitEditing,
}: Readonly<HiddenCodeInputProps>): React.JSX.Element {
  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={(typedText) => {
        onValueChange(keepOnlyCodeDigits(typedText));
      }}
      onFocus={() => {
        onFocusChange(true);
      }}
      onBlur={() => {
        onFocusChange(false);
        onBlur();
      }}
      onSubmitEditing={onSubmitEditing}
      accessibilityLabel={accessibilityLabel}
      keyboardType="number-pad"
      autoComplete="one-time-code"
      textContentType="oneTimeCode"
      maxLength={VERIFICATION_CODE_LENGTH}
      caretHidden
      style={CODE_INPUT_OVERLAY_STYLE}
    />
  );
}

/**
 * Código de 6 dígitos en casillas separadas. Un único `TextInput` invisible recoge lo escrito (y el
 * relleno automático del correo); las casillas solo lo dibujan, así el teclado y el lector de
 * pantalla ven un campo normal.
 */
export function VerificationCodeBoxes({
  value,
  accessibilityLabel,
  errorMessage,
  onValueChange,
  onBlur,
  onSubmitEditing,
}: Readonly<VerificationCodeBoxesProps>): React.JSX.Element {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <Pressable
        accessible={false}
        onPress={() => inputRef.current?.focus()}
        style={CODE_BOXES_ROW_STYLE}
      >
        <CodeBoxRow value={value} isFocused={isFocused} isInvalid={errorMessage !== undefined} />
        <HiddenCodeInput
          inputRef={inputRef}
          value={value}
          accessibilityLabel={accessibilityLabel}
          onValueChange={onValueChange}
          onFocusChange={setIsFocused}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
        />
      </Pressable>
      {errorMessage === undefined ? null : (
        <Text variant="caption" color="danger" align="center" role="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
