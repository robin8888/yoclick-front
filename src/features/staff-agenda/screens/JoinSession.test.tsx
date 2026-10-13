import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { renderScreen } from '@/test/render-screen';

import { NewAppointmentScreen } from './NewAppointmentScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const ROOMS_PATH = `GET ${CENTER_PATH}/agenda/rooms`;
const ELIGIBLE_PATH = `GET ${CENTER_PATH}/passes/eligible`;
const JOIN_PATH = `${CENTER_PATH}/agenda/bookings/join-group`;
const SESSION_ID = '0191d6a0-0000-7000-8000-0000000000e1';
const MARTA_ID = '0191d6a0-0000-7000-8000-0000000000d1';
const LUIS_ID = '0191d6a0-0000-7000-8000-0000000000d2';

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

const ELIGIBLE_MARTA = {
  membershipId: MARTA_ID,
  fullName: 'Marta Ruiz',
  photoUrl: 'https://files.example.com/marta.jpg',
  bookableSessions: 4,
};
const ELIGIBLE_LUIS = {
  membershipId: LUIS_ID,
  fullName: 'Luis Gil',
  photoUrl: null,
  bookableSessions: 1,
};

const ELIGIBLE = { clients: [ELIGIBLE_MARTA] };

const TWO_ELIGIBLE = { clients: [ELIGIBLE_MARTA, ELIGIBLE_LUIS] };

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

// Las citas de prueba son del 12 de octubre de 2026: «ahora» es esa mañana para que no estén «terminadas».
beforeEach(() => {
  freezeClockAt('2026-10-12T06:00:00.000Z');
});

afterEach(() => {
  restoreClock();
});

describe('NewAppointmentScreen · joining a class of a room', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ date: '2026-10-12', sessionId: SESSION_ID });
  });

  it('shows the class as decided and only asks for the person', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA, [ELIGIBLE_PATH]: ELIGIBLE, [`POST ${JOIN_PATH}`]: {} });
    renderScreen(<NewAppointmentScreen />);

    expect(await screen.findByText('Inglés B1')).toBeOnTheScreen();
    expect(screen.getByText('Da la clase Ana Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('17:00–18:30')).toBeOnTheScreen();
    expect(screen.getByText('Sala 1')).toBeOnTheScreen();
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

  it('joins several people to the same class with one save', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA, [ELIGIBLE_PATH]: TWO_ELIGIBLE, [`POST ${JOIN_PATH}`]: {} });
    renderScreen(<NewAppointmentScreen />);

    fireEvent.press(await screen.findByText('Marta Ruiz'));
    fireEvent.press(screen.getByText('Luis Gil'));

    expect(screen.getByText('2 personas elegidas: Marta Ruiz, Luis Gil')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Apuntar' }));

    await waitFor(() => {
      expect(getMockRouter().back).toHaveBeenCalled();
    });
    const joinedClientIds = getRecordedApiCalls()
      .filter((call) => call.method === 'POST' && call.path.startsWith(JOIN_PATH))
      .map((call) => (call.body as { clientMembershipId: string }).clientMembershipId);
    expect(joinedClientIds).toEqual([MARTA_ID, LUIS_ID]);
  });

  it('only offers the people who have a pass with classes, and says how many they can still book', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA, [ELIGIBLE_PATH]: TWO_ELIGIBLE });
    renderScreen(<NewAppointmentScreen />);

    expect(await screen.findByText('Marta Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('4 clases por agendar')).toBeOnTheScreen();
    expect(screen.getByText('1 clase por agendar')).toBeOnTheScreen();
    expect(findApiCall('GET', `${CENTER_PATH}/passes/eligible`)).toBeDefined();
  });

  it('explains that nobody can be added when nobody has a pass in force', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA, [ELIGIBLE_PATH]: { clients: [] } });
    renderScreen(<NewAppointmentScreen />);

    expect(
      await screen.findByText(/Ninguna persona tiene un bono en vigor con clases/),
    ).toBeOnTheScreen();
  });

  it('does not let anyone join a full class', async () => {
    mockApi({
      [ROOMS_PATH]: {
        ...AGENDA,
        rooms: [{ ...AGENDA.rooms[0], sessions: [{ ...SESSION, bookedCount: 12 }] }],
      },
      [ELIGIBLE_PATH]: ELIGIBLE,
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
