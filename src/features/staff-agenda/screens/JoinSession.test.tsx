import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { NewAppointmentScreen } from './NewAppointmentScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const ROOMS_PATH = `GET ${CENTER_PATH}/agenda/rooms`;
const CLIENTS_PATH = `GET ${CENTER_PATH}/clients`;
const JOIN_PATH = `${CENTER_PATH}/agenda/bookings/join-group`;
const SESSION_ID = '0191d6a0-0000-7000-8000-0000000000e1';
const MARTA_ID = '0191d6a0-0000-7000-8000-0000000000d1';

const SESSION = {
  id: SESSION_ID,
  startsAt: '2026-10-12T15:00:00.000Z',
  endsAt: '2026-10-12T16:30:00.000Z',
  mode: 'group',
  capacity: 12,
  bookedCount: 3,
  service: { id: 'service-english', name: 'Inglés B1', color: null },
  teacher: { membershipId: 'staff-ana', fullName: 'Ana Ruiz' },
  schedule: null,
  cancelledReason: null,
  attendees: [],
};

const AGENDA = {
  date: '2026-10-12',
  timezone: 'Europe/Madrid',
  openingRanges: [{ opensAt: '09:00', closesAt: '21:00' }],
  rooms: [
    { id: 'room-1', name: 'Sala 1', capacity: 12, staff: null, sessions: [SESSION], blocks: [] },
  ],
  sessionsWithoutRoom: [],
};

const CLIENTS = {
  totalClientCount: 1,
  matchingCount: 1,
  clients: [
    {
      membershipId: MARTA_ID,
      fullName: 'Marta Ruiz',
      email: 'marta@example.com',
      status: 'active',
      activity: 'active',
      level: null,
      group: null,
      joinedAt: '2026-01-10T09:00:00.000Z',
      bookingCount: 2,
      lastBookingAt: null,
    },
  ],
};

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('NewAppointmentScreen · joining a class of a room', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ date: '2026-10-12', sessionId: SESSION_ID });
  });

  it('shows the class as decided and only asks for the person', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA, [CLIENTS_PATH]: CLIENTS, [`POST ${JOIN_PATH}`]: {} });
    renderScreen(<NewAppointmentScreen />);

    expect(await screen.findByText('Inglés B1')).toBeOnTheScreen();
    expect(screen.getByText('Da la clase Ana Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('Sala 1 · 17:00–18:30')).toBeOnTheScreen();
    expect(screen.getByText('3 de 12 plazas ocupadas')).toBeOnTheScreen();
    expect(screen.queryByText('Tipo de cita')).not.toBeOnTheScreen();
    expect(screen.queryByText('Servicio')).not.toBeOnTheScreen();

    fireEvent.press(await screen.findByText('Marta Ruiz'));
    fireEvent.press(screen.getByRole('button', { name: 'Apuntar' }));

    await waitFor(() => {
      expect(findApiCall('POST', JOIN_PATH)?.body).toEqual({
        clientMembershipId: MARTA_ID,
        classSessionId: SESSION_ID,
      });
    });
    expect(getMockRouter().back).toHaveBeenCalled();
  });

  it('does not let anyone join a full class', async () => {
    mockApi({
      [ROOMS_PATH]: {
        ...AGENDA,
        rooms: [{ ...AGENDA.rooms[0], sessions: [{ ...SESSION, bookedCount: 12 }] }],
      },
      [CLIENTS_PATH]: CLIENTS,
    });
    renderScreen(<NewAppointmentScreen />);

    expect(
      await screen.findByText(
        'Esta clase no admite a más gente: está completa, es privada o se ha cancelado',
      ),
    ).toBeOnTheScreen();
    fireEvent.press(await screen.findByText('Marta Ruiz'));

    expect(screen.getByRole('button', { name: 'Apuntar' })).toBeDisabled();
  });
});
