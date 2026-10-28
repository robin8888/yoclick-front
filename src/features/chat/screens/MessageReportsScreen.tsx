import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { MessageReportListResponseDtoReportsItem } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useOpenMessageReports, useReviewMessageReport } from '../hooks/useChatSafety';
import { createReportCardStyle } from './ChatSafety.styles';

const CENTER_TIME_ZONE = 'Europe/Madrid';

function ReportedContent({
  report,
}: Readonly<{ report: MessageReportListResponseDtoReportsItem }>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong">
        {i18n.t('chat.reports.from', { name: report.reportedSenderName })}
      </Text>
      {report.reportedBody === null ? null : <Text>{report.reportedBody}</Text>}
      {report.reportedAttachmentName === null ? null : (
        <Text color="ink2">
          {i18n.t('chat.reports.attachment', { name: report.reportedAttachmentName })}
        </Text>
      )}
    </>
  );
}

function ReportCard({
  report,
  isBusy,
  onReviewPress,
}: Readonly<{
  report: MessageReportListResponseDtoReportsItem;
  isBusy: boolean;
  onReviewPress: () => void;
}>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createReportCardStyle(theme)}>
      <Text variant="overline" color="warning">
        {i18n.t(`chat.report.reasons.${report.reason}`)}
      </Text>
      <ReportedContent report={report} />
      {report.details === null ? null : <Text color="ink2">{report.details}</Text>}
      <Text variant="caption" color="ink2">
        {i18n.t('chat.reports.reportedBy', {
          name: report.reporterName,
          date: formatShortDate(report.createdAt, CENTER_TIME_ZONE),
        })}
      </Text>
      <Button
        variant="outline"
        label={i18n.t('chat.reports.reviewAction')}
        isLoading={isBusy}
        onPress={onReviewPress}
      />
    </View>
  );
}

function MessageReportRows({
  reports,
}: Readonly<{ reports: readonly MessageReportListResponseDtoReportsItem[] }>): React.JSX.Element {
  const reviewing = useReviewMessageReport();

  return (
    <>
      {reviewing.errorMessage === null ? null : (
        <FormErrorBanner message={reviewing.errorMessage} />
      )}
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          isBusy={reviewing.pendingReportId === report.id}
          onReviewPress={() => {
            reviewing.review(report.id);
          }}
        />
      ))}
    </>
  );
}

function MessageReportsList(): React.JSX.Element {
  const reports = useOpenMessageReports();

  if (reports.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (reports.isError) {
    return (
      <LoadErrorState
        title={i18n.t('chat.reports.errorTitle')}
        error={reports.error}
        onRetry={() => {
          void reports.refetch();
        }}
        isRetrying={reports.isFetching}
      />
    );
  }
  if (reports.data.reports.length === 0) {
    return (
      <View>
        <Text variant="titleMd">{i18n.t('chat.reports.emptyTitle')}</Text>
        <Text color="ink2">{i18n.t('chat.reports.emptyDescription')}</Text>
      </View>
    );
  }
  return <MessageReportRows reports={reports.data.reports} />;
}

/**
 * Las denuncias de mensajes del chat para quien gestiona el centro. Es la única forma de leer algo de una
 * conversación privada: solo el mensaje que la otra persona decidió denunciar (Apple 1.2).
 */
export function MessageReportsScreen(): React.JSX.Element {
  const onBackPress = useBackAction();

  return (
    <ScreenTemplate
      title={i18n.t('chat.reports.title')}
      subtitle={i18n.t('chat.reports.subtitle')}
      onBackPress={onBackPress}
    >
      <MessageReportsList />
    </ScreenTemplate>
  );
}
