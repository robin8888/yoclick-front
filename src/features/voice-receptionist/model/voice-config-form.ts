import { z } from 'zod';

import type {
  UpdateVoiceConfigRequestDto,
  VoiceConfigResponseDto,
  VoiceOverviewResponseDtoConfig,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

// Mismos límites que `UpdateVoiceConfigRequestDto` (docs/api/openapi.yaml).
const MAX_GREETING_LENGTH = 500;
const MAX_ASSISTANT_NAME_LENGTH = 80;
const MAX_LEGAL_NOTICE_LENGTH = 500;
const MIN_RETENTION_DAYS = 1;
const MAX_RETENTION_DAYS = 365;
const DEFAULT_RETENTION_DAYS = 30;
const TRANSFER_PHONE_PATTERN = /^\+\d{8,15}$/;

export const FORWARDING_MODES = ['always', 'no_answer', 'busy', 'outside_hours'] as const;
export const OVERAGE_POLICIES = ['continue_and_charge', 'disable_bot'] as const;

/** Quita espacios y guiones: «+34 600 11 22 33» vale igual que «+34600112233». */
export function normalizePhoneText(phoneText: string): string {
  return phoneText.replaceAll(/[\s-]/g, '');
}

function isValidRetentionText(retentionText: string): boolean {
  const days = Number(retentionText);
  return (
    retentionText.trim() !== '' &&
    Number.isInteger(days) &&
    days >= MIN_RETENTION_DAYS &&
    days <= MAX_RETENTION_DAYS
  );
}

function isValidTransferPhoneText(phoneText: string): boolean {
  const normalized = normalizePhoneText(phoneText);
  return normalized === '' || TRANSFER_PHONE_PATTERN.test(normalized);
}

function buildMaxLengthSchema(maxLength: number): z.ZodString {
  return z
    .string()
    .trim()
    .max(maxLength, {
      error: () => i18n.t('voiceReceptionist.config.textTooLong', { max: maxLength }),
    });
}

export const voiceConfigFormSchema = z.object({
  greeting: buildMaxLengthSchema(MAX_GREETING_LENGTH),
  assistantName: buildMaxLengthSchema(MAX_ASSISTANT_NAME_LENGTH),
  legalNotice: buildMaxLengthSchema(MAX_LEGAL_NOTICE_LENGTH),
  humanTransferPhone: z.string().refine(isValidTransferPhoneText, {
    error: () => i18n.t('voiceReceptionist.config.transferPhoneInvalid'),
  }),
  transcriptRetentionDays: z.string().refine(isValidRetentionText, {
    error: () =>
      i18n.t('voiceReceptionist.config.retentionInvalid', {
        min: MIN_RETENTION_DAYS,
        max: MAX_RETENTION_DAYS,
      }),
  }),
  forwardingMode: z.enum(FORWARDING_MODES),
  overagePolicy: z.enum(OVERAGE_POLICIES),
});
export type VoiceConfigFormValues = z.infer<typeof voiceConfigFormSchema>;

type SavedConfig = NonNullable<VoiceOverviewResponseDtoConfig> | VoiceConfigResponseDto;

const DEFAULT_VOICE_CONFIG_FORM_VALUES: VoiceConfigFormValues = {
  greeting: '',
  assistantName: '',
  legalNotice: '',
  humanTransferPhone: '',
  transcriptRetentionDays: String(DEFAULT_RETENTION_DAYS),
  forwardingMode: 'no_answer',
  overagePolicy: 'continue_and_charge',
};

export function buildVoiceConfigFormValues(config: SavedConfig | null): VoiceConfigFormValues {
  if (config === null) return DEFAULT_VOICE_CONFIG_FORM_VALUES;
  return {
    greeting: config.greeting ?? '',
    assistantName: config.assistantName ?? '',
    legalNotice: config.legalNotice ?? '',
    humanTransferPhone: config.humanTransferPhone ?? '',
    transcriptRetentionDays: String(config.transcriptRetentionDays),
    forwardingMode: config.forwardingMode,
    overagePolicy: config.overagePolicy,
  };
}

function emptyToNull(text: string): string | null {
  const trimmed = text.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Lo que se envía al guardar. El saludo y el nombre del asistente solo se mandan si el plan los
 * deja cambiar: el servidor rechaza el cambio si no (402).
 */
export function mapVoiceConfigFormToRequest(
  formValues: VoiceConfigFormValues,
  canCustomizeAssistant: boolean,
): UpdateVoiceConfigRequestDto {
  const request: UpdateVoiceConfigRequestDto = {
    legalNotice: emptyToNull(formValues.legalNotice),
    humanTransferPhone: emptyToNull(normalizePhoneText(formValues.humanTransferPhone)),
    transcriptRetentionDays: Number(formValues.transcriptRetentionDays),
    forwardingMode: formValues.forwardingMode,
    overagePolicy: formValues.overagePolicy,
  };
  if (!canCustomizeAssistant) return request;
  return {
    ...request,
    greeting: emptyToNull(formValues.greeting),
    assistantName: emptyToNull(formValues.assistantName),
  };
}
