import { resolveNotificationDestination } from './notification-destination';

const CONVERSATION_ID = '0198f4a0-0000-7000-8000-000000000010';

describe('resolveNotificationDestination', () => {
  it.each([
    ['booking_created', 'staff', '/(staff)/day-agenda'],
    ['booking_created', 'admin', '/(admin)/day-agenda'],
    ['booking_cancelled_by_team', 'client', '/(client)/(tabs)/bookings'],
    ['session_cancelled', 'client', '/(client)/(tabs)/bookings'],
    ['routine_assigned', 'client', '/(client)/(tabs)/practice'],
    ['pass_activated', 'client', '/(client)/my-passes'],
    ['pass_running_low', 'client', '/(client)/my-passes'],
    ['pass_requested', 'admin', '/(admin)/passes'],
    ['payment_received', 'admin', '/(admin)/payments'],
    ['member_joined', 'admin', '/(admin)/(tabs)/clients'],
    ['staff_profile_submitted', 'admin', '/(admin)/team/profiles'],
    ['staff_profile_reviewed', 'staff', '/(staff)/public-profile'],
    ['privacy_request_resolved', 'client', '/(client)/privacy'],
    ['voice_minutes_80', 'admin', '/(admin)/voice-receptionist'],
    ['voice_minutes_100', 'admin', '/(admin)/voice-receptionist'],
  ] as const)('%s for %s goes to %s', (kind, audience, expected) => {
    expect(resolveNotificationDestination(kind, { audience, noticeData: {} })).toBe(expected);
  });

  it('has no destination for a notice that does not concern that profile', () => {
    expect(
      resolveNotificationDestination('pass_requested', { audience: 'client', noticeData: {} }),
    ).toBeNull();
  });

  it('opens the conversation of a message notice, or the inbox without one', () => {
    expect(
      resolveNotificationDestination('message_received', {
        audience: 'staff',
        noticeData: { conversationId: CONVERSATION_ID },
      }),
    ).toEqual({
      pathname: '/(staff)/messages/[conversationId]',
      params: { conversationId: CONVERSATION_ID },
    });
    expect(
      resolveNotificationDestination('message_received', { audience: 'client', noticeData: {} }),
    ).toEqual({ pathname: '/(client)/messages', params: {} });
  });
  it('takes a guardian to My children for the notice of a child', () => {
    expect(
      resolveNotificationDestination('booking_cancelled_by_team', {
        audience: 'client',
        noticeData: { forChildName: 'Lucía' },
      }),
    ).toBe('/(client)/children');
  });
});
