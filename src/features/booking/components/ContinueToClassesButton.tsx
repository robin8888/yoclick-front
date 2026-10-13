import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

interface ContinueToClassesButtonProps {
  selectedServiceId: string | null;
}

/** «Continuar» del paso 1: desactivado hasta elegir servicio; lleva a elegir día y clase. */
export function ContinueToClassesButton({
  selectedServiceId,
}: Readonly<ContinueToClassesButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      label={i18n.t('booking.book.continueLabel')}
      isFullWidth
      isDisabled={selectedServiceId === null}
      onPress={() => {
        if (selectedServiceId === null) return;
        router.push({ pathname: '/(client)/book/slot', params: { serviceId: selectedServiceId } });
      }}
    />
  );
}
