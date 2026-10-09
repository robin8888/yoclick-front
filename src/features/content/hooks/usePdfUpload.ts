import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { contentAddDocument } from '@/shared/api/generated/endpoints/content/content';
import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { buildDocumentTitle, isPdfTooLarge, PDF_UPLOAD_TIMEOUT_MS } from '../model/pdf-upload';
import { useActiveCenterId } from './useActiveCenterId';

export type PdfUploadStage =
  { kind: 'idle' } | { kind: 'uploading' } | { kind: 'failed'; message: string };

const IDLE_STAGE: PdfUploadStage = { kind: 'idle' };
const PDF_MIME_TYPE = 'application/pdf';

export interface PdfUpload {
  stage: PdfUploadStage;
  isBusy: boolean;
  /** Abre el selector de ficheros y sube el PDF elegido; avisa cuando ya está en la biblioteca. */
  start: (onUploaded: (content: ContentResponseDto) => void) => void;
}

async function pickPdfFile(): Promise<DocumentPicker.DocumentPickerAsset | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: PDF_MIME_TYPE,
    copyToCacheDirectory: true,
  });
  return result.canceled ? null : (result.assets[0] ?? null);
}

async function readFileAsBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

/** El recorrido de subir un PDF: elegirlo, comprobar su tamaño y enviarlo al servidor, que lo guarda. */
export function usePdfUpload(): PdfUpload {
  const centerId = useActiveCenterId();
  const [stage, setStage] = useState<PdfUploadStage>(IDLE_STAGE);

  async function run(onUploaded: (content: ContentResponseDto) => void): Promise<void> {
    const asset = await pickPdfFile();
    if (asset === null) return;
    if (isPdfTooLarge(asset.size ?? 0)) {
      setStage({ kind: 'failed', message: i18n.t('content.upload.pdfTooLarge') });
      return;
    }
    setStage({ kind: 'uploading' });
    const body = await readFileAsBlob(asset.uri).catch(() => null);
    if (body === null) {
      setStage({ kind: 'failed', message: i18n.t('content.upload.pdfReadError') });
      return;
    }
    const content = await contentAddDocument(
      centerId,
      body,
      { title: buildDocumentTitle(asset.name) },
      { timeoutMs: PDF_UPLOAD_TIMEOUT_MS },
    );
    setStage(IDLE_STAGE);
    onUploaded(content);
  }

  return {
    stage,
    isBusy: stage.kind === 'uploading',
    start: (onUploaded) => {
      run(onUploaded).catch((error: unknown) => {
        setStage({ kind: 'failed', message: getApiErrorMessage(error) });
      });
    },
  };
}
