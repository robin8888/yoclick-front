import { buildNotContractedVoiceOverview, buildVoiceOverview } from '@/test/voice-factories';

import { formatCallDuration, VOICE_OUTCOME_LABEL_KEYS } from './voice-call-labels';
import {
  buildVoiceConfigFormValues,
  mapVoiceConfigFormToRequest,
  normalizePhoneText,
  voiceConfigFormSchema,
} from './voice-config-form';
import {
  canToggleVoiceReceptionist,
  isVoiceReceptionistAvailable,
  resolveVoiceServiceState,
} from './voice-service-state';
import { clampBarPercent, resolveVoiceUsageLevel } from './voice-usage';

const ACTIVE_SUBSCRIPTION = buildVoiceOverview().subscription;

describe('resolveVoiceServiceState', () => {
  it.each([
    ['no subscription', buildNotContractedVoiceOverview(), 'not_contracted'],
    [
      'a cancelled subscription',
      buildVoiceOverview({
        subscription: ACTIVE_SUBSCRIPTION && { ...ACTIVE_SUBSCRIPTION, status: 'cancelled' },
      }),
      'cancelled',
    ],
    [
      'a paused subscription',
      buildVoiceOverview({
        subscription: ACTIVE_SUBSCRIPTION && { ...ACTIVE_SUBSCRIPTION, status: 'paused' },
      }),
      'paused',
    ],
    [
      'an active subscription with the switch on',
      buildVoiceOverview({ isEnabled: true }),
      'active',
    ],
    [
      'an active subscription with the switch off',
      buildVoiceOverview({ isEnabled: false }),
      'inactive',
    ],
  ] as const)('is %s → %s', (_label, overview, expectedState) => {
    expect(resolveVoiceServiceState(overview)).toBe(expectedState);
  });

  it('shows the access on the home only when the service is contracted and not cancelled', () => {
    const cancelled = buildVoiceOverview({
      subscription: ACTIVE_SUBSCRIPTION && { ...ACTIVE_SUBSCRIPTION, status: 'cancelled' },
    });

    expect(isVoiceReceptionistAvailable(buildVoiceOverview())).toBe(true);
    expect(isVoiceReceptionistAvailable(buildNotContractedVoiceOverview())).toBe(false);
    expect(isVoiceReceptionistAvailable(cancelled)).toBe(false);
  });

  it('lets the switch be used only with a running subscription and an assigned number', () => {
    expect(canToggleVoiceReceptionist(buildVoiceOverview())).toBe(true);
    expect(canToggleVoiceReceptionist(buildVoiceOverview({ line: null }))).toBe(false);
    expect(canToggleVoiceReceptionist(buildNotContractedVoiceOverview())).toBe(false);
  });
});

describe('voice usage', () => {
  it.each([
    [0, 'normal'],
    [79, 'normal'],
    [80, 'near_limit'],
    [99, 'near_limit'],
    [100, 'limit_reached'],
    [140, 'limit_reached'],
  ] as const)('%s %% is %s', (usedPercent, expectedLevel) => {
    expect(resolveVoiceUsageLevel(usedPercent)).toBe(expectedLevel);
  });

  it.each([
    [-5, 0],
    [42, 42],
    [180, 100],
  ])('draws a %s %% usage as a bar of %s %%', (usedPercent, expectedBar) => {
    expect(clampBarPercent(usedPercent)).toBe(expectedBar);
  });
});

describe('voice call labels', () => {
  it('has a text for every outcome the API can return', () => {
    expect(
      Object.keys(VOICE_OUTCOME_LABEL_KEYS).sort((first, second) => first.localeCompare(second)),
    ).toEqual(['booking', 'cancellation', 'no_action', 'reschedule', 'transfer', 'waitlist']);
  });

  it.each([
    [null, null],
    [0, '0 min 00 s'],
    [125, '2 min 05 s'],
    [3600, '60 min 00 s'],
  ])('writes a duration of %s seconds as %s', (durationSeconds, expectedText) => {
    expect(formatCallDuration(durationSeconds)).toBe(expectedText);
  });
});

describe('voice config form', () => {
  it('starts from the saved settings, or from sensible defaults when there are none', () => {
    expect(buildVoiceConfigFormValues(buildVoiceOverview().config)).toMatchObject({
      greeting: 'Hola, gracias por llamar',
      transcriptRetentionDays: '30',
      forwardingMode: 'no_answer',
    });
    expect(buildVoiceConfigFormValues(null)).toMatchObject({
      greeting: '',
      forwardingMode: 'no_answer',
      overagePolicy: 'continue_and_charge',
    });
  });

  it.each([
    ['', true],
    ['+34600112233', true],
    ['+34 600 11 22 33', true],
    ['600112233', false],
    ['+34abc', false],
    ['+123', false],
  ])('accepts the transfer phone "%s": %s', (humanTransferPhone, isValid) => {
    const parsed = voiceConfigFormSchema.safeParse({
      ...buildVoiceConfigFormValues(null),
      humanTransferPhone,
    });

    expect(parsed.success).toBe(isValid);
  });

  it.each([
    ['0', false],
    ['1', true],
    ['365', true],
    ['366', false],
    ['abc', false],
    ['', false],
  ])('accepts %s days of retention: %s', (transcriptRetentionDays, isValid) => {
    const parsed = voiceConfigFormSchema.safeParse({
      ...buildVoiceConfigFormValues(null),
      transcriptRetentionDays,
    });

    expect(parsed.success).toBe(isValid);
  });

  it('normalizes spaces and dashes in a phone number', () => {
    expect(normalizePhoneText('+34 600-11 22 33')).toBe('+34600112233');
  });

  it('sends the greeting and the assistant name only when the center may change them', () => {
    const formValues = {
      ...buildVoiceConfigFormValues(null),
      greeting: ' Hola ',
      assistantName: '',
      humanTransferPhone: '+34 600 11 22 33',
    };

    expect(mapVoiceConfigFormToRequest(formValues, true)).toMatchObject({
      greeting: 'Hola',
      assistantName: null,
      humanTransferPhone: '+34600112233',
    });
    const withoutCustomization = mapVoiceConfigFormToRequest(formValues, false);
    expect(withoutCustomization).not.toHaveProperty('greeting');
    expect(withoutCustomization).not.toHaveProperty('assistantName');
  });
});
