import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

interface AttendanceActionsProps {
  hasEntries: boolean;
  isSharingReport: boolean;
  reportErrorMessage: string | null;
  onAddPress: () => void;
  onReportPress: () => void;
}

/**
 * Añadir un día olvidado y sacar el informe del mes (PDF) para enviarlo al centro. Con el mes vacío,
 * «Añadir» es la acción del propio estado vacío y no se repite aquí.
 */
export function AttendanceActions({
  hasEntries,
  isSharingReport,
  reportErrorMessage,
  onAddPress,
  onReportPress,
}: Readonly<AttendanceActionsProps>): React.JSX.Element {
  return (
    <>
      {reportErrorMessage === null ? null : <FormErrorBanner message={reportErrorMessage} />}
      {hasEntries ? (
        <Button
          variant="outline"
          leadingIconName="plus"
          label={i18n.t('timeClock.addAction')}
          isFullWidth
          onPress={onAddPress}
        />
      ) : null}
      <Button
        leadingIconName="file"
        label={i18n.t('timeClock.reportAction')}
        isFullWidth
        isLoading={isSharingReport}
        isDisabled={!hasEntries}
        onPress={onReportPress}
      />
    </>
  );
}
