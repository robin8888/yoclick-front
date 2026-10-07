import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { TeamMemberAvailabilityScreen } from './StaffAvailabilityScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const MEMBERSHIP_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789ab';
const BASE_PATH = `/v1/centers/${NORTE_CENTER_ID}/team/${MEMBERSHIP_ID}`;
const AVAILABILITY_PATH = `${BASE_PATH}/availability`;
const ABSENCE_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789ad';

const CLOSED_DAY = [] as const;
const OWN_HOURS = {
  mon: [{ opensAt: '10:00', closesAt: '12:00' }],
  tue: CLOSED_DAY,
  wed: CLOSED_DAY,
  thu: CLOSED_DAY,
  fri: CLOSED_DAY,
  sat: CLOSED_DAY,
  sun: CLOSED_DAY,
};

function mockAvailability(availability: object, extra: Record<string, unknown> = {}): void {
  mockApi({
    'GET /v1/me/memberships': { memberships: [] },
    [`GET ${AVAILABILITY_PATH}`]: availability,
    [`PUT ${AVAILABILITY_PATH}`]: availability,
    ...extra,
  });
}

describe('TeamMemberAvailabilityScreen', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
    jest.mocked(useLocalSearchParams).mockReturnValue({ membershipId: MEMBERSHIP_ID });
  });

  it('says the person follows the center hours and offers a normal week to start from', async () => {
    mockAvailability({ weeklyHours: null, absences: [] });
    renderScreen(<TeamMemberAvailabilityScreen />);

    expect(await screen.findByText(/Ahora sigue el horario del centro/)).toBeOnTheScreen();
    expect(screen.getByText('No hay ausencias.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Volver al horario del centro' })).toBeNull();
  });

  it('saves the week as own hours', async () => {
    mockAvailability({ weeklyHours: null, absences: [] });
    renderScreen(<TeamMemberAvailabilityScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Guardar horario' }));

    await waitFor(() => {
      expect(findApiCall('PUT', AVAILABILITY_PATH)?.body).toMatchObject({
        weeklyHours: {
          mon: [{ opensAt: '09:00', closesAt: '17:00' }],
          sat: [],
          sun: [],
        },
      });
    });
  });

  it('goes back to the center hours', async () => {
    mockAvailability({ weeklyHours: OWN_HOURS, absences: [] });
    renderScreen(<TeamMemberAvailabilityScreen />);
    expect(await screen.findByText('Tiene un horario propio.')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Volver al horario del centro' }));

    await waitFor(() => {
      expect(findApiCall('PUT', AVAILABILITY_PATH)?.body).toEqual({ weeklyHours: null });
    });
  });

  it('lists the absences and removes one', async () => {
    mockAvailability(
      {
        weeklyHours: null,
        absences: [
          { id: ABSENCE_ID, startsOn: '2026-11-23', endsOn: '2026-11-27', reason: 'vacation' },
        ],
      },
      { [`DELETE ${BASE_PATH}/absences/${ABSENCE_ID}`]: undefined },
    );
    renderScreen(<TeamMemberAvailabilityScreen />);
    expect(await screen.findByText('Vacaciones')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: /Quitar la ausencia/ }));

    await waitFor(() => {
      expect(findApiCall('DELETE', `${BASE_PATH}/absences/${ABSENCE_ID}`)).toBeDefined();
    });
  });

  it('adds an absence and warns about the bookings that were already in those days', async () => {
    mockAvailability(
      { weeklyHours: null, absences: [] },
      {
        [`POST ${BASE_PATH}/absences`]: {
          id: ABSENCE_ID,
          startsOn: '2026-11-23',
          endsOn: '2026-11-23',
          reason: 'training',
          affectedBookingCount: 2,
        },
      },
    );
    renderScreen(<TeamMemberAvailabilityScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Añadir ausencia' }));

    fireEvent.changeText(screen.getByLabelText('Desde'), '23/11/2026');
    fireEvent.press(screen.getByRole('radio', { name: 'Formación' }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar ausencia' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE_PATH}/absences`)?.body).toEqual({
        startsOn: '2026-11-23',
        endsOn: '2026-11-23',
        reason: 'training',
      });
    });
    expect(await screen.findByText(/Hay 2 citas en esos días/)).toBeOnTheScreen();
  });

  it('does not let the person save an absence with wrong dates', async () => {
    mockAvailability({ weeklyHours: null, absences: [] });
    renderScreen(<TeamMemberAvailabilityScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Añadir ausencia' }));

    fireEvent.changeText(screen.getByLabelText('Desde'), '23/11');

    expect(screen.getByRole('button', { name: 'Guardar ausencia' })).toBeDisabled();
  });

  it('shows an error when the availability cannot be loaded', async () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    renderScreen(<TeamMemberAvailabilityScreen />);

    expect(await screen.findByText('No hemos podido cargar la disponibilidad')).toBeOnTheScreen();
  });
});
