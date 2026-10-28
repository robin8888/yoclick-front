import { useState } from 'react';

import type { ReportMessageRequestDto } from '@/shared/api/generated/model';

import { canBlockPerson, type ChatRole } from '../model/block-rules';
import { useBlockPerson, useReportMessage } from './useChatSafety';
import { useMyChatRole } from './useMyChatRole';

interface ReportFlow {
  /** El mensaje que se está denunciando; `null` con la hoja cerrada. */
  reportedMessageId: string | null;
  hasSentReport: boolean;
  isReporting: boolean;
  errorMessage: string | null;
  open: (messageId: string) => void;
  close: () => void;
  submit: (report: { reason: ReportMessageRequestDto['reason']; details: string }) => void;
}

/** Denunciar un mensaje de la conversación: abre la hoja, manda la denuncia y avisa de que salió. */
export function useReportFlow(conversationId: string): ReportFlow {
  const reporting = useReportMessage(conversationId);
  const [reportedMessageId, setReportedMessageId] = useState<string | null>(null);
  const [hasSentReport, setHasSentReport] = useState(false);

  return {
    reportedMessageId,
    hasSentReport,
    isReporting: reporting.isReporting,
    errorMessage: reporting.errorMessage,
    open: (messageId) => {
      reporting.reset();
      setHasSentReport(false);
      setReportedMessageId(messageId);
    },
    close: () => {
      setReportedMessageId(null);
    },
    submit: ({ reason, details }) => {
      if (reportedMessageId === null) return;
      reporting.report({ messageId: reportedMessageId, reason, details }, () => {
        setReportedMessageId(null);
        setHasSentReport(true);
      });
    },
  };
}

export interface BlockablePerson {
  membershipId: string;
  role: ChatRole;
}

interface BlockFlow {
  canBlock: boolean;
  isConfirmVisible: boolean;
  isBlocking: boolean;
  errorMessage: string | null;
  openConfirm: () => void;
  closeConfirm: () => void;
  confirm: () => void;
}

/** Bloquear a la otra persona de la conversación, solo si las reglas lo permiten (alumno ↔ profesor). */
export function useBlockFlow(person: BlockablePerson | null, onBlocked: () => void): BlockFlow {
  const myRole = useMyChatRole();
  const blocking = useBlockPerson();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const canBlock = person !== null && canBlockPerson({ myRole, counterpartRole: person.role });

  return {
    canBlock,
    isConfirmVisible,
    isBlocking: blocking.isBlocking,
    errorMessage: blocking.errorMessage,
    openConfirm: () => {
      blocking.reset();
      setIsConfirmVisible(true);
    },
    closeConfirm: () => {
      setIsConfirmVisible(false);
    },
    confirm: () => {
      if (person === null) return;
      blocking.block(person.membershipId, () => {
        setIsConfirmVisible(false);
        onBlocked();
      });
    },
  };
}
