import { ApiError } from '@/shared/api/api-error';

import { describeBookingFailure, isPassNeededError } from './pass-needed';

describe('isPassNeededError', () => {
  it.each([
    ['the pass needed to book', new ApiError({ code: 'PASS_NEEDED_TO_BOOK', status: 409 }), true],
    ['another conflict', new ApiError({ code: 'SLOT_UNAVAILABLE', status: 409 }), false],
    ['an unknown failure', new Error('boom'), false],
    ['nothing', null, false],
  ])('tells %s', (_case, error, isExpected) => {
    expect(isPassNeededError(error)).toBe(isExpected);
  });
});

describe('describeBookingFailure', () => {
  it('has nothing to say when nothing failed', () => {
    expect(describeBookingFailure(null)).toEqual({ createErrorMessage: null, isPassNeeded: false });
  });

  it('asks for a pass instead of showing an error when the center sells passes', () => {
    const failure = describeBookingFailure(
      new ApiError({ code: 'PASS_NEEDED_TO_BOOK', status: 409 }),
    );

    expect(failure).toEqual({ createErrorMessage: null, isPassNeeded: true });
  });

  it('shows the reason of any other refusal', () => {
    const failure = describeBookingFailure(new ApiError({ code: 'SLOT_UNAVAILABLE', status: 409 }));

    expect(failure.isPassNeeded).toBe(false);
    expect(failure.createErrorMessage).toEqual(expect.any(String));
  });
});
