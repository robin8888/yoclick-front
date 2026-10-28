import { useState } from 'react';
import { View } from 'react-native';

import type { ReportMessageRequestDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { OptionCard } from '@/ui/molecules/OptionCard';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { createReportSheetBodyStyle } from './ReportMessageSheet.styles';

type ReportReason = ReportMessageRequestDto['reason'];

const REPORT_REASONS: readonly ReportReason[] = ['spam', 'harassment', 'inappropriate', 'other'];

interface ReportMessageSheetProps {
  isVisible: boolean;
  isSending: boolean;
  errorMessage: string | null;
  onSubmit: (report: { reason: ReportReason; details: string }) => void;
  onDismiss: () => void;
}

function ReasonOptions({
  selectedReason,
  onReasonSelect,
}: Readonly<{
  selectedReason: ReportReason | null;
  onReasonSelect: (reason: ReportReason) => void;
}>): React.JSX.Element {
  return (
    <>
      {REPORT_REASONS.map((option) => (
        <OptionCard
          key={option}
          title={i18n.t(`chat.report.reasons.${option}`)}
          isSelected={selectedReason === option}
          onPress={() => {
            onReasonSelect(option);
          }}
        />
      ))}
    </>
  );
}

function ReportForm({
  isSending,
  errorMessage,
  onSubmit,
  onDismiss,
}: Readonly<Omit<ReportMessageSheetProps, 'isVisible'>>): React.JSX.Element {
  const theme = useTheme();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  return (
    <View style={createReportSheetBodyStyle(theme)}>
      <Text color="ink2">{i18n.t('chat.report.intro')}</Text>
      <ReasonOptions selectedReason={reason} onReasonSelect={setReason} />
      <Input
        value={details}
        onChangeText={setDetails}
        accessibilityLabel={i18n.t('chat.report.detailsLabel')}
        placeholder={i18n.t('chat.report.detailsLabel')}
        maxLength={500}
      />
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <Button
        label={i18n.t('chat.report.sendAction')}
        isLoading={isSending}
        isDisabled={reason === null}
        onPress={() => {
          if (reason !== null) onSubmit({ reason, details });
        }}
      />
      <Button
        variant="ghost"
        label={i18n.t('actions.cancel')}
        isDisabled={isSending}
        onPress={onDismiss}
      />
    </View>
  );
}

/**
 * Denunciar un mensaje (Apple 1.2): el motivo y, si se quiere, unos detalles. La denuncia llega a quien
 * gestiona el centro; la otra persona no se entera. Se monta con `key` por mensaje para empezar limpia.
 */
export function ReportMessageSheet({
  isVisible,
  ...formProps
}: Readonly<ReportMessageSheetProps>): React.JSX.Element {
  return (
    <BottomSheet
      isVisible={isVisible}
      title={i18n.t('chat.report.sheetTitle')}
      onDismiss={formProps.onDismiss}
    >
      <ReportForm {...formProps} />
    </BottomSheet>
  );
}
