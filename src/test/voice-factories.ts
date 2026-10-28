import type { VoiceOverviewResponseDto } from '@/shared/api/generated/model';

export function buildVoiceOverview(
  overrides: Partial<VoiceOverviewResponseDto> = {},
): VoiceOverviewResponseDto {
  return {
    planId: 'premium',
    isEnabled: true,
    line: { phoneNumber: '+34910000000', provider: 'vapi', isActive: true },
    subscription: {
      status: 'active',
      includedMinutes: 400,
      periodStart: '2026-10-01T00:00:00.000Z',
      periodEnd: '2026-11-01T00:00:00.000Z',
    },
    config: {
      greeting: 'Hola, gracias por llamar',
      assistantName: 'Sofía',
      voice: null,
      language: 'es-ES',
      forwardingMode: 'no_answer',
      humanTransferPhone: null,
      legalNotice: null,
      transcriptRetentionDays: 30,
      overagePolicy: 'continue_and_charge',
    },
    addonPlan: { monthlyPriceCents: 8900, includedMinutes: 400, overageCentsPerMinute: 35 },
    capabilities: {
      canJoinWaitlist: true,
      canBookGroupSessions: true,
      canBookForChildren: true,
      canCustomizeAssistant: true,
      canSendPaymentLink: true,
    },
    usage: {
      includedMinutes: 400,
      usedMinutes: 100,
      remainingMinutes: 300,
      overageMinutes: 0,
      usedPercent: 25,
    },
    ...overrides,
  };
}

/** El centro no tiene el servicio: ni suscripción, ni número, ni ajustes. */
export function buildNotContractedVoiceOverview(): VoiceOverviewResponseDto {
  return buildVoiceOverview({
    isEnabled: false,
    line: null,
    subscription: null,
    config: null,
    addonPlan: null,
    usage: null,
  });
}
