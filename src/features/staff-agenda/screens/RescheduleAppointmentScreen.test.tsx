import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import {
  BOOKING_ID,
  SERVICE_ID,
  STAFF_MEMBERSHIP_ID,
  buildAvailability,
  buildBooking,
} from '@/test/booking-factories';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { RescheduleAppointmentScreen } from './RescheduleAppointmentScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const AVAILABILITY_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/availability`;
const RESCHEDULE_PATH = `/v1/centers/${NORTE_CENTER_ID}/agenda/bookings/${BOOKING_ID}/reschedule`;
// 16:00 UTC son las 18:00 en Madrid (horario de verano).
const EVENING_SLOT_STARTS_AT = '2026-10-08T16:00:00.000Z';

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

async function chooseEveningSlot(): Promise<void> {
  fireEvent.press(await screen.findByRole('button', { name: '18 h' }));
  fireEvent.press(screen.getByRole('button', { name: '18:00' }));
}

describe('RescheduleAppointmentScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({
      bookingId: BOOKING_ID,
      serviceId: SERVICE_ID,
      staffMembershipId: STAFF_MEMBERSHIP_ID,
      date: '2026-10-08',
    });
  });

  it('keeps the confirm button disabled until a free slot is chosen', async () => {
    mockApi({ [AVAILABILITY_PATH]: buildAvailability() });
    renderScreen(<RescheduleAppointmentScreen />);

    expect(await screen.findByRole('button', { name: '18 h' })).toBeOnTheScreen();

    expect(screen.getByRole('button', { name: 'Confirmar nueva hora' })).toBeDisabled();
  });

  it('moves the appointment to the chosen slot of the same person and closes both screens', async () => {
    mockApi({
      [AVAILABILITY_PATH]: buildAvailability(),
      [`POST ${RESCHEDULE_PATH}`]: buildBooking({ startsAt: EVENING_SLOT_STARTS_AT }),
    });
    renderScreen(<RescheduleAppointmentScreen />);
    await chooseEveningSlot();

    fireEvent.press(screen.getByRole('button', { name: 'Confirmar nueva hora' }));

    await waitFor(() => {
      expect(getMockRouter().dismiss).toHaveBeenCalledWith(2);
    });
    expect(findApiCall('POST', RESCHEDULE_PATH)?.body).toEqual({
      startsAt: EVENING_SLOT_STARTS_AT,
      staffMembershipId: STAFF_MEMBERSHIP_ID,
    });
  });

  it('shows the server message and stays on the screen when the slot was taken', async () => {
    mockApi({
      [AVAILABILITY_PATH]: buildAvailability(),
      [`POST ${RESCHEDULE_PATH}`]: () => {
        throw buildApiError('SLOT_UNAVAILABLE', 409);
      },
    });
    renderScreen(<RescheduleAppointmentScreen />);
    await chooseEveningSlot();

    fireEvent.press(screen.getByRole('button', { name: 'Confirmar nueva hora' }));

    expect(await screen.findByText('Esa hora ya no está disponible. Elige otra')).toBeOnTheScreen();
    expect(getMockRouter().dismiss).not.toHaveBeenCalled();
  });

  it('asks for the free slots of the next day when moving forward and forgets the chosen hour', async () => {
    mockApi({ [AVAILABILITY_PATH]: buildAvailability() });
    renderScreen(<RescheduleAppointmentScreen />);
    await chooseEveningSlot();

    fireEvent.press(screen.getByRole('button', { name: 'Día siguiente' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirmar nueva hora' })).toBeDisabled();
    });
    expect(findApiCall('GET', `/v1/centers/${NORTE_CENTER_ID}/availability?`)).toBeDefined();
  });

  it('goes back to the start when the route parameters are not valid', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ bookingId: 'no-es-un-uuid' });
    mockApi({});
    renderScreen(<RescheduleAppointmentScreen />);

    expect(screen.getByText('redirect:/')).toBeOnTheScreen();
  });
});
