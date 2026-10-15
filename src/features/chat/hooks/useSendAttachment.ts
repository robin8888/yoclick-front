import { useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';

import { pickPreparedPhoto } from '@/features/photos';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  chatSendAttachment,
  getChatListConversationsQueryKey,
  getChatListMessagesQueryKey,
} from '@/shared/api/generated/endpoints/chat/chat';
import { i18n } from '@/shared/i18n';

import { ATTACHMENT_UPLOAD_TIMEOUT_MS, isPdfAttachmentTooLarge } from '../model/attachment-limits';
import { useActiveCenterId } from './useActiveCenterId';

const PDF_MIME_TYPE = 'application/pdf';
const PHOTO_FILE_NAME = 'foto.jpg';

export type AttachmentSource = 'photo' | 'pdf';

interface SendAttachment {
  attach: (source: AttachmentSource) => void;
  isUploading: boolean;
  errorMessage: string | null;
}

interface PickedFile {
  blob: Blob;
  name: string;
}

type PickOutcome = PickedFile | 'too-large' | null;

async function pickPhoto(): Promise<PickOutcome> {
  const outcome = await pickPreparedPhoto('library', 'free');
  return outcome.kind === 'photo' ? { blob: outcome.blob, name: PHOTO_FILE_NAME } : null;
}

async function pickPdf(): Promise<PickOutcome> {
  const result = await DocumentPicker.getDocumentAsync({
    type: PDF_MIME_TYPE,
    copyToCacheDirectory: true,
  });
  const asset = result.canceled ? null : (result.assets[0] ?? null);
  if (asset === null) return null;
  if (isPdfAttachmentTooLarge(asset.size ?? 0)) return 'too-large';
  const blob = await (await fetch(asset.uri)).blob();
  return { blob, name: asset.name };
}

/** Elegir una foto o un PDF y enviarlo como mensaje; el servidor comprueba el tipo por los bytes. */
export function useSendAttachment(conversationId: string): SendAttachment {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function upload(source: AttachmentSource): Promise<void> {
    const picked = source === 'pdf' ? await pickPdf() : await pickPhoto();
    if (picked === null) return;
    if (picked === 'too-large') {
      setErrorMessage(i18n.t('chat.attachmentTooLarge'));
      return;
    }
    setIsUploading(true);
    await chatSendAttachment(
      centerId,
      conversationId,
      picked.blob,
      { fileName: picked.name },
      { timeoutMs: ATTACHMENT_UPLOAD_TIMEOUT_MS },
    );
    await queryClient.invalidateQueries({
      queryKey: getChatListMessagesQueryKey(centerId, conversationId),
    });
    void queryClient.invalidateQueries({ queryKey: getChatListConversationsQueryKey(centerId) });
  }

  return {
    attach: (source) => {
      setErrorMessage(null);
      upload(source)
        .catch((error: unknown) => {
          setErrorMessage(getApiErrorMessage(error));
        })
        .finally(() => {
          setIsUploading(false);
        });
    },
    isUploading,
    errorMessage,
  };
}
