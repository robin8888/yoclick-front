import { useState } from 'react';

import type { PlatformCenterDetailResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import { ChargeFormSheet } from './ChargeFormSheet';

interface RecordChargeActionProps {
  center: Pick<PlatformCenterDetailResponseDto, 'id' | 'name' | 'planId'>;
}

/** El botón de la ficha de un centro para apuntar a mano el cobro de su plan. */
export function RecordChargeAction({
  center,
}: Readonly<RecordChargeActionProps>): React.JSX.Element {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        leadingIconName="plus"
        label={i18n.t('platform.charges.record')}
        isFullWidth
        onPress={() => {
          setIsFormVisible(true);
        }}
      />
      <ChargeFormSheet
        center={center}
        isVisible={isFormVisible}
        onDismiss={() => {
          setIsFormVisible(false);
        }}
      />
    </>
  );
}
