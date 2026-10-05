import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

interface ScanAttendanceButtonProps {
  /** Administración y personal tienen cada uno su ruta; la pantalla es la misma. */
  isCenterWide: boolean;
}

/** Abre el escáner de asistencia: quien atiende registra la llegada leyendo el QR de la persona. */
export function ScanAttendanceButton({
  isCenterWide,
}: Readonly<ScanAttendanceButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      leadingIconName="qrCode"
      label={i18n.t('attendance.scan.openAction')}
      onPress={() => {
        router.push(isCenterWide ? '/(admin)/scan' : '/(staff)/scan');
      }}
    />
  );
}
