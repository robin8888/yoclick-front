import { buildNewAppointmentRequest } from './new-appointment-request';

const COMPLETE = {
  clientMembershipId: 'membership-ana',
  staffMembershipId: 'membership-staff',
  serviceId: 'service-1',
  startsAt: '2026-10-12T10:00:00.000Z',
  mode: 'private' as const,
  roomId: null,
};

describe('buildNewAppointmentRequest', () => {
  it('is ready once the client, the professional, the service and the hour are chosen', () => {
    expect(buildNewAppointmentRequest(COMPLETE)).toEqual({
      clientMembershipId: 'membership-ana',
      staffMembershipId: 'membership-staff',
      serviceId: 'service-1',
      startsAt: '2026-10-12T10:00:00.000Z',
    });
  });

  it('carries the room of the appointment when the center has rooms', () => {
    expect(buildNewAppointmentRequest({ ...COMPLETE, roomId: 'room-1' })).toMatchObject({
      roomId: 'room-1',
    });
  });

  it('sends a group appointment with its room, and is not ready without one', () => {
    expect(
      buildNewAppointmentRequest({ ...COMPLETE, mode: 'group', roomId: 'room-1' }),
    ).toMatchObject({ mode: 'group', roomId: 'room-1' });
    expect(buildNewAppointmentRequest({ ...COMPLETE, mode: 'group' })).toBeNull();
  });

  it.each(['clientMembershipId', 'staffMembershipId', 'serviceId', 'startsAt'] as const)(
    'is not ready without the %s',
    (missingField) => {
      expect(buildNewAppointmentRequest({ ...COMPLETE, [missingField]: null })).toBeNull();
    },
  );
});
