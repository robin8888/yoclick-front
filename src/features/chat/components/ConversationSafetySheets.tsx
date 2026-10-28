import { i18n } from '@/shared/i18n';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import type { useBlockFlow, useReportFlow } from '../hooks/useConversationSafety';
import { ReportMessageSheet } from './ReportMessageSheet';

interface ConversationSafetySheetsProps {
  counterpartName: string;
  report: ReturnType<typeof useReportFlow>;
  block: ReturnType<typeof useBlockFlow>;
}

/** Las dos hojas de seguridad de la conversación: denunciar un mensaje y confirmar el bloqueo. */
export function ConversationSafetySheets({
  counterpartName,
  report,
  block,
}: Readonly<ConversationSafetySheetsProps>): React.JSX.Element {
  return (
    <>
      <ReportMessageSheet
        key={report.reportedMessageId ?? 'closed'}
        isVisible={report.reportedMessageId !== null}
        isSending={report.isReporting}
        errorMessage={report.errorMessage}
        onSubmit={report.submit}
        onDismiss={report.close}
      />
      <ConfirmSheet
        isVisible={block.isConfirmVisible}
        title={i18n.t('chat.block.title', { name: counterpartName })}
        message={block.errorMessage ?? i18n.t('chat.block.message')}
        confirmLabel={i18n.t('chat.block.confirm')}
        dismissLabel={i18n.t('chat.block.dismiss')}
        isConfirming={block.isBlocking}
        isDestructive
        onConfirm={block.confirm}
        onDismiss={block.closeConfirm}
      />
    </>
  );
}
