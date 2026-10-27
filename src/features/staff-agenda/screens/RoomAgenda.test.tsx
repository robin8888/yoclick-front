import { act, fireEvent, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { FINISHED_PALETTE } from '@/shared/theme';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { renderScreen } from '@/test/render-screen';

import { RoomAgendaList } from '../components/RoomAgendaList';
import { RoomDayGrid } from '../components/RoomDayGrid';
import { RoomWeekStrip } from '../components/RoomWeekStrip';
import { RoomDayScreen } from './RoomDayScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const ROOM_ID = '0191d6a0-0000-7000-8000-0000000000f1';
const ROOMS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/agenda/rooms`;

const SESSION = {
  id: '0191d6a0-0000-7000-8000-0000000000e1',
  startsAt: '2026-10-12T15:00:00.000Z',
  endsAt: '2026-10-12T16:00:00.000Z',
  mode: 'group',
  capacity: 10,
  bookedCount: 2,
  service: { id: 'service-salsa', name: 'Salsa', color: null },
  teacher: { membershipId: 'staff-ana', fullName: 'Ana Ruiz' },
  schedule: null,
  location: null,
  cancelledReason: null,
  attendees: [
    {
      bookingId: '0191d6a0-0000-7000-8000-0000000000c1',
      clientMembershipId: 'client-1',
      photoUrl: null,
      fullName: 'Lucía Torres',
      status: 'confirmed',
      source: 'single',
    },
    {
      bookingId: '0191d6a0-0000-7000-8000-0000000000c2',
      clientMembershipId: 'client-2',
      photoUrl: null,
      fullName: 'Marcos Díaz',
      status: 'confirmed',
      source: 'single',
    },
  ],
};

const AGENDA = {
  date: '2026-10-12',
  timezone: 'Europe/Madrid',
  openingRanges: [{ opensAt: '16:00', closesAt: '19:00' }],
  rooms: [
    {
      id: ROOM_ID,
      name: 'Sala de baile',
      capacity: 10,
      staff: { membershipId: 'staff-ana', fullName: 'Ana Ruiz' },
      sessions: [SESSION],
      blocks: [],
    },
    { id: 'room-2', name: 'Aula común', capacity: 6, staff: null, sessions: [], blocks: [] },
  ],
  sessionsWithoutRoom: [],
};

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

describe('RoomAgendaList', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('shows each room with its capacity, its teacher and the hours it is busy', () => {
    renderScreen(
      <RoomAgendaList
        agenda={AGENDA as unknown as Parameters<typeof RoomAgendaList>[0]['agenda']}
        isoDate="2026-10-12"
      />,
    );

    expect(screen.getByText('Sala de baile')).toBeOnTheScreen();
    expect(screen.getByText(/Aforo 10 · Da clase Ana Ruiz/)).toBeOnTheScreen();
    expect(screen.getByText('Salsa · con Ana Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('2 de 10 plazas ocupadas')).toBeOnTheScreen();
    expect(screen.getByText('Libre todo el día')).toBeOnTheScreen();
  });

  it('opens the detail of the room for that day', () => {
    renderScreen(
      <RoomAgendaList
        agenda={AGENDA as unknown as Parameters<typeof RoomAgendaList>[0]['agenda']}
        isoDate="2026-10-12"
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: /Sala de baile, aforo 10/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/room-day/[roomId]',
      params: { roomId: ROOM_ID, date: '2026-10-12' },
    });
  });
});

const GRID_AGENDA = AGENDA as unknown as Parameters<typeof RoomDayGrid>[0]['agenda'];

describe('RoomDayGrid', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('shows the legend of rooms and a chip per class, with its seats, in the hour it starts', () => {
    renderScreen(<RoomDayGrid agenda={GRID_AGENDA} isoDate="2026-10-12" />);

    expect(screen.getByText('16:00')).toBeOnTheScreen();
    expect(screen.getByText('18:00')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'A: Sala de baile' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'B: Aula común' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Salsa.*2\/10/ })).toBeOnTheScreen();
  });

  it('paints a cancelled class grey, with its state written', () => {
    const cancelledAgenda = {
      ...GRID_AGENDA,
      rooms: GRID_AGENDA.rooms.map((room) => ({
        ...room,
        sessions: room.sessions.map((session) => ({ ...session, cancelledReason: 'Festivo' })),
      })),
    };
    renderScreen(<RoomDayGrid agenda={cancelledAgenda} isoDate="2026-10-12" />);

    const chip = screen.getByRole('button', { name: /Sala de baile, Salsa.*Cancelada/ });

    expect(chip).toHaveStyle({ backgroundColor: FINISHED_PALETTE.background });
    expect(screen.getByText('Cancelada')).toBeOnTheScreen();
  });

  it('opens the detail of the room when a chip is pressed', () => {
    renderScreen(<RoomDayGrid agenda={GRID_AGENDA} isoDate="2026-10-12" />);

    fireEvent.press(screen.getByRole('button', { name: /Sala de baile, Salsa/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/room-day/[roomId]',
      params: { roomId: ROOM_ID, date: '2026-10-12' },
    });
  });

  it('counts the time of a class that is running instead of showing its seats', () => {
    const runningAgenda = {
      ...GRID_AGENDA,
      rooms: GRID_AGENDA.rooms.map((room) => ({
        ...room,
        sessions: room.sessions.map((session) => ({
          ...session,
          startedAt: new Date(Date.now() - 125_000).toISOString(),
          endedAt: null,
        })),
      })),
    };
    renderScreen(<RoomDayGrid agenda={runningAgenda} isoDate="2026-10-12" />);

    expect(screen.getAllByText(/^En curso · 02:0\d$/).length).toBeGreaterThan(0);
  });

  it('opens the appointment itself when each lane is a professional', () => {
    renderScreen(<RoomDayGrid agenda={GRID_AGENDA} isoDate="2026-10-12" isStaffLane />);

    fireEvent.press(screen.getByRole('button', { name: /Sala de baile, Salsa/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/sessions/[bookingId]',
      params: {
        bookingId: '0191d6a0-0000-7000-8000-0000000000c1',
        date: '2026-10-12',
        isCenterWide: 'true',
      },
    });
  });

  it('offers the services of the day as a filter and keeps only the chosen one', () => {
    renderScreen(<RoomDayGrid agenda={GRID_AGENDA} isoDate="2026-10-12" />);

    expect(screen.getByRole('radio', { name: 'Todos los servicios' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('radio', { name: 'Salsa' }));

    expect(screen.getByRole('button', { name: /Salsa.*2\/10/ })).toBeOnTheScreen();
  });

  it('filters the grid to one room from the legend and back', () => {
    renderScreen(<RoomDayGrid agenda={GRID_AGENDA} isoDate="2026-10-12" />);

    fireEvent.press(screen.getByRole('radio', { name: 'B: Aula común' }));
    expect(screen.queryByRole('button', { name: /Salsa.*2\/10/ })).not.toBeOnTheScreen();

    fireEvent.press(screen.getByRole('radio', { name: 'B: Aula común' }));
    expect(screen.getByRole('button', { name: /Salsa.*2\/10/ })).toBeOnTheScreen();
  });
});

describe('RoomWeekStrip', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('shows the week of the chosen day with a dot per busy room and lets you pick a day', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA });
    const onDaySelect = jest.fn();
    renderScreen(
      <RoomWeekStrip selectedIsoDate="2026-10-14" agenda={GRID_AGENDA} onDaySelect={onDaySelect} />,
    );

    expect(
      await screen.findByRole('button', { name: 'lunes 12 de octubre, 1 sala con clases' }),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: /viernes 16 de octubre/ }));

    expect(onDaySelect).toHaveBeenCalledWith('2026-10-16');
  });
});

describe('RoomDayScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ roomId: ROOM_ID, date: '2026-10-12' });
  });

  it('shows the class, its teacher, the seats and the students assigned', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA });
    renderScreen(<RoomDayScreen />);

    expect(await screen.findByText('Salsa')).toBeOnTheScreen();
    expect(screen.getByText('Da la clase Ana Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('2 de 10 plazas ocupadas')).toBeOnTheScreen();
    expect(screen.getByText('Lucía Torres')).toBeOnTheScreen();
    expect(screen.getByText('Marcos Díaz')).toBeOnTheScreen();
  });

  it('shows a class that already ended as finished, with nothing left to change', async () => {
    freezeClockAt('2026-10-12T20:00:00.000Z');
    mockApi({ [ROOMS_PATH]: AGENDA });
    renderScreen(<RoomDayScreen />);

    expect(await screen.findByText('Terminada')).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Apuntar a alguien a este grupo' }),
    ).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cancelar este día' })).not.toBeOnTheScreen();
  });

  it('opens the profile of a student assigned to the class', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA });
    renderScreen(<RoomDayScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Lucía Torres. Ver su perfil' }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/clients/[membershipId]',
      params: { membershipId: 'client-1' },
    });
  });

  it('lets the center add more students to a group with free seats', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA });
    renderScreen(<RoomDayScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Apuntar a alguien a este grupo' }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/new-appointment',
      params: { date: '2026-10-12', sessionId: SESSION.id },
    });
  });
});
