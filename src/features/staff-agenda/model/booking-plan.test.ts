import {
  buildBookingPlan,
  executeBookingPlan,
  type BookingPlan,
  type BookingPlanApi,
} from './booking-plan';

const CHOSEN = {
  staffMembershipId: 'staff-1',
  serviceId: 'service-1',
  startsAt: '2026-10-13T17:00:00.000Z',
  mode: 'group',
  roomId: 'room-1',
  joinSessionId: null,
} as const;

function requirePlan(planned: Parameters<typeof buildBookingPlan>[0]): BookingPlan {
  const plan = buildBookingPlan(planned);
  if (plan === null) throw new Error('The plan should be ready');
  return plan;
}

function buildApi(overrides: Partial<BookingPlanApi> = {}): BookingPlanApi {
  return {
    createBooking: jest.fn().mockResolvedValue({ session: { id: 'session-new' } }),
    joinGroup: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe('buildBookingPlan', () => {
  it('needs at least one person', () => {
    expect(buildBookingPlan({ ...CHOSEN, clientMembershipIds: [] })).toBeNull();
  });

  it('creates the class with the first person and keeps the group room', () => {
    const plan = buildBookingPlan({ ...CHOSEN, clientMembershipIds: ['ana', 'luis'] });

    expect(plan?.clientMembershipIds).toEqual(['ana', 'luis']);
    expect(plan?.createTemplate).toEqual({
      staffMembershipId: 'staff-1',
      serviceId: 'service-1',
      startsAt: '2026-10-13T17:00:00.000Z',
      mode: 'group',
      roomId: 'room-1',
    });
  });

  it('is not ready while the time or the room is missing', () => {
    expect(
      buildBookingPlan({ ...CHOSEN, startsAt: null, clientMembershipIds: ['ana'] }),
    ).toBeNull();
    expect(buildBookingPlan({ ...CHOSEN, roomId: null, clientMembershipIds: ['ana'] })).toBeNull();
  });

  it('only needs the people when joining a class that already exists', () => {
    const plan = buildBookingPlan({
      ...CHOSEN,
      startsAt: null,
      staffMembershipId: null,
      serviceId: null,
      joinSessionId: 'session-9',
      clientMembershipIds: ['ana', 'luis'],
    });

    expect(plan).toEqual({
      clientMembershipIds: ['ana', 'luis'],
      joinSessionId: 'session-9',
      createTemplate: null,
    });
  });
});

describe('executeBookingPlan', () => {
  const plan = requirePlan({ ...CHOSEN, clientMembershipIds: ['ana', 'luis', 'marta'] });

  it('creates the class with the first person and joins the rest to it', async () => {
    const api = buildApi();

    const outcome = await executeBookingPlan(plan, api);

    expect(api.createBooking).toHaveBeenCalledTimes(1);
    expect(api.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({ clientMembershipId: 'ana' }),
    );
    expect(api.joinGroup).toHaveBeenNthCalledWith(1, {
      clientMembershipId: 'luis',
      classSessionId: 'session-new',
    });
    expect(api.joinGroup).toHaveBeenNthCalledWith(2, {
      clientMembershipId: 'marta',
      classSessionId: 'session-new',
    });
    expect(outcome.failedClientMembershipIds).toEqual([]);
  });

  it('joins nobody when the class could not be created', async () => {
    const failure = new Error('SLOT_UNAVAILABLE');
    const api = buildApi({ createBooking: jest.fn().mockRejectedValue(failure) });

    const outcome = await executeBookingPlan(plan, api);

    expect(api.joinGroup).not.toHaveBeenCalled();
    expect(outcome.failedClientMembershipIds).toEqual(['ana', 'luis', 'marta']);
    expect(outcome.firstError).toBe(failure);
  });

  it('keeps going and reports who was left out when someone cannot join', async () => {
    const failure = new Error('SESSION_FULL');
    const api = buildApi({
      joinGroup: jest.fn().mockRejectedValueOnce(failure).mockResolvedValue({}),
    });

    const outcome = await executeBookingPlan(plan, api);

    expect(api.joinGroup).toHaveBeenCalledTimes(2);
    expect(outcome.failedClientMembershipIds).toEqual(['luis']);
    expect(outcome.firstError).toBe(failure);
  });

  it('joins everyone to the existing class without creating anything', async () => {
    const api = buildApi();
    const joinPlan = requirePlan({
      ...CHOSEN,
      joinSessionId: 'session-9',
      clientMembershipIds: ['ana', 'luis'],
    });

    await executeBookingPlan(joinPlan, api);

    expect(api.createBooking).not.toHaveBeenCalled();
    expect(api.joinGroup).toHaveBeenCalledTimes(2);
  });
});
