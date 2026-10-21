import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormField } from '@/ui/molecules/FormField';

import { formatClientCapForInput, parseClientCap } from '../model/client-cap';

interface ClientCapFormProps {
  currentMaxClients: number | null;
  isSaving: boolean;
  onSave: (maxClients: number | null) => void;
}

/** Cambiar el tope de clientes activos del plan: vacío = sin tope. La API valida igual. */
export function ClientCapForm({
  currentMaxClients,
  isSaving,
  onSave,
}: Readonly<ClientCapFormProps>): React.JSX.Element {
  const [text, setText] = useState(formatClientCapForInput(currentMaxClients));
  const [isInvalid, setIsInvalid] = useState(false);

  const handleSave = (): void => {
    const parsed = parseClientCap(text);
    setIsInvalid(!parsed.isValid);
    if (parsed.isValid) onSave(parsed.value);
  };

  return (
    <>
      <FormField
        label={i18n.t('platform.center.capLabel')}
        value={text}
        onChangeText={(nextText) => {
          setText(nextText);
          setIsInvalid(false);
        }}
        keyboardType="number-pad"
        errorMessage={isInvalid ? i18n.t('platform.center.capInvalid') : undefined}
      />
      <Button
        variant="outline"
        label={i18n.t('platform.center.saveCap')}
        isLoading={isSaving}
        onPress={handleSave}
      />
    </>
  );
}
