import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

interface ContinueToStaffButtonProps {
  selectedServiceId: string | null;
}

/** «Continuar» del paso 1: desactivado hasta elegir servicio; lleva a elegir quién. */
export function ContinueToStaffButton({
  selectedServiceId,
}: Readonly<ContinueToStaffButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      label={i18n.t('booking.book.continueLabel')}
      isFullWidth
      isDisabled={selectedServiceId === null}
      onPress={() => {
        if (selectedServiceId === null) return;
        router.push({ pathname: '/(client)/book/staff', params: { serviceId: selectedServiceId } });
      }}
    />
  );
}
