import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { NewAppointmentScreen } from './NewAppointmentScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const SERVICE_ID = '0191d6a0-0000-7000-8000-0000000000a1';
const FREE_SERVICE_ID = '0191d6a0-0000-7000-8000-0000000000a2';
const SESSION_ID = '0191d6a0-0000-7000-8000-0000000000e1';
const MARTA_ID = '0191d6a0-0000-7000-8000-0000000000d1';
const LUIS_ID = '0191d6a0-0000-7000-8000-0000000000d2';
const TEACHER_ID = '0191d6a0-0000-7000-8000-0000000000b1';
const JOIN_PATH = `${CENTER_PATH}/agenda/bookings/join-group`;

function buildService(id: string, name: string) {
  return {
    id,
    name,
    description: null,
    kind: 'individual',
    mode: 'both',
    durationMinutes: 60,
    priceCents: null,
    currency: 'EUR',
    color: null,
    bookingWindowDays: 30,
    minNoticeMinutes: 0,
    isVisible: true,
    room: null,
    hasSchedule: true,
    schedules: [],
    staff: [],
  };
}

function buildClient(membershipId: string, fullName: string) {
  return {
    membershipId,
    fullName,
    email: `${fullName.toLowerCase().replace(' ', '.')}@example.com`,
    status: 'active',
    activity: 'active',
    level: null,
    group: null,
    joinedAt: '2026-01-10T09:00:00.000Z',
    bookingCount: 0,
    lastBookingAt: null,
    photoUrl: null,
  };
}

const OPEN_SESSIONS = {
  timezone: 'Europe/Madrid',
  isScheduled: true,
  sessions: [
    {
      id: SESSION_ID,
      startsAt: '2026-10-14T08:30:00.000Z',
      endsAt: '2026-10-14T10:30:00.000Z',
      mode: 'group',
      capacity: 10,
      bookedCount: 3,
      remainingSeats: 7,
      room: { id: 'room-1', name: 'Sala 1' },
      teacher: { membershipId: TEACHER_ID, fullName: 'Ana Ruiz' },
      label: 'Grupo especial karate',
    },
  ],
  nextOpenStartsAt: '2026-10-14T08:30:00.000Z',
};

const COMMON_API = {
  [`GET ${CENTER_PATH}/services`]: {
    services: [buildService(SERVICE_ID, 'Karate'), buildService(FREE_SERVICE_ID, 'Masaje')],
  },
  [`GET ${CENTER_PATH}/team`]: { members: [] },
  [`GET ${CENTER_PATH}/rooms`]: { rooms: [] },
  [`GET ${CENTER_PATH}/clients`]: {
    totalClientCount: 2,
    matchingCount: 2,
    clients: [buildClient(MARTA_ID, 'Marta Ruiz'), buildClient(LUIS_ID, 'Luis Gil')],
  },
  [`GET ${CENTER_PATH}/services/${SERVICE_ID}/open-sessions`]: OPEN_SESSIONS,
  [`GET ${CENTER_PATH}/services/${FREE_SERVICE_ID}/open-sessions`]: {
    timezone: 'Europe/Madrid',
    isScheduled: false,
    sessions: [],
    nextOpenStartsAt: null,
  },
  [`GET ${CENTER_PATH}/passes/eligible`]: {
    clients: [
      { membershipId: MARTA_ID, fullName: 'Marta Ruiz', photoUrl: null, bookableSessions: 4 },
      { membershipId: LUIS_ID, fullName: 'Luis Gil', photoUrl: null, bookableSessions: 2 },
    ],
  },
  [`POST ${JOIN_PATH}`]: {},
};

describe('NewAppointmentScreen · service with a room schedule', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
    freezeClockAt('2026-10-13T08:00:00.000Z');
    jest.mocked(useLocalSearchParams).mockReturnValue({ date: '2026-10-14' });
  });

  afterEach(() => {
    restoreClock();
  });

  it('offers the classes of the service with their seats and assigns several people to one', async () => {
    mockApi(COMMON_API);
    renderScreen(<NewAppointmentScreen />);

    fireEvent.press(await screen.findByText('Marta Ruiz'));
    fireEvent.press(await screen.findByText('Karate'));
    // Con un servicio de horario caben varias personas en la misma clase.
    fireEvent.press(await screen.findByText('Luis Gil'));

    expect(await screen.findByText('10:30–12:30 · Sala 1')).toBeOnTheScreen();
    expect(screen.getByText('Ana Ruiz · quedan 7 de 10 plazas')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('10:30–12:30 · Sala 1'));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cita' }));

    await waitFor(() => {
      expect(getMockRouter().back).toHaveBeenCalled();
    });
    const joinedClientIds = getRecordedApiCalls()
      .filter((call) => call.method === 'POST' && call.path.startsWith(JOIN_PATH))
      .map((call) => call.body as { clientMembershipId: string; classSessionId: string })
      .map(({ clientMembershipId, classSessionId }) => `${clientMembershipId}:${classSessionId}`);
    expect(joinedClientIds).toEqual([`${MARTA_ID}:${SESSION_ID}`, `${LUIS_ID}:${SESSION_ID}`]);
  });

  it('only offers people with an active pass for a scheduled service, and warns about the chosen without one', async () => {
    mockApi({
      ...COMMON_API,
      [`GET ${CENTER_PATH}/passes/eligible`]: {
        clients: [
          { membershipId: LUIS_ID, fullName: 'Luis Gil', photoUrl: null, bookableSessions: 2 },
        ],
      },
    });
    renderScreen(<NewAppointmentScreen />);

    fireEvent.press(await screen.findByText('Marta Ruiz'));
    fireEvent.press(await screen.findByText('Karate'));

    expect(
      await screen.findByText(/Sin bono en vigor para este servicio: Marta Ruiz/),
    ).toBeOnTheScreen();
    expect(screen.getByText('Luis Gil')).toBeOnTheScreen();
    expect(screen.queryByText('Ana Ruiz')).toBeNull();
  });

  it('keeps the free hour flow for a service that has no room schedule', async () => {
    mockApi(COMMON_API);
    renderScreen(<NewAppointmentScreen />);

    fireEvent.press(await screen.findByText('Marta Ruiz'));
    fireEvent.press(await screen.findByText('Masaje'));

    expect(await screen.findByText(/profesional/i)).toBeOnTheScreen();
    expect(screen.queryByText('Día de la clase')).not.toBeOnTheScreen();
    expect(screen.queryByText('Clases de ese día')).not.toBeOnTheScreen();
  });
});
