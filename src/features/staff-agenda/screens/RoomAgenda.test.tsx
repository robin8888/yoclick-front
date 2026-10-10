import { act, fireEvent, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { RoomAgendaList } from '../components/RoomAgendaList';
import { RoomTimeline } from '../components/RoomTimeline';
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
  attendees: [
    {
      bookingId: '0191d6a0-0000-7000-8000-0000000000c1',
      clientMembershipId: 'client-1',
      fullName: 'Lucía Torres',
      status: 'confirmed',
    },
    {
      bookingId: '0191d6a0-0000-7000-8000-0000000000c2',
      clientMembershipId: 'client-2',
      fullName: 'Marcos Díaz',
      status: 'confirmed',
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
    },
    { id: 'room-2', name: 'Aula común', capacity: 6, staff: null, sessions: [] },
  ],
  sessionsWithoutRoom: [],
};

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

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

describe('RoomTimeline', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('shows the hours the center is open with the rooms booked and who is missing', () => {
    renderScreen(
      <RoomTimeline
        agenda={AGENDA as unknown as Parameters<typeof RoomTimeline>[0]['agenda']}
        isoDate="2026-10-12"
      />,
    );

    expect(screen.getByText('16:00')).toBeOnTheScreen();
    expect(screen.getByText('18:00')).toBeOnTheScreen();
    expect(screen.getByText('Sala de baile')).toBeOnTheScreen();
    expect(screen.getByText('Salsa · con Ana Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('Faltan 8 para el aforo (2 de 10)')).toBeOnTheScreen();
  });

  it('opens the detail of the room when a booked hour is pressed', () => {
    renderScreen(
      <RoomTimeline
        agenda={AGENDA as unknown as Parameters<typeof RoomTimeline>[0]['agenda']}
        isoDate="2026-10-12"
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: /Sala de baile, Salsa/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/room-day/[roomId]',
      params: { roomId: ROOM_ID, date: '2026-10-12' },
    });
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

  it('lets the center add more students to a group with free seats', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA });
    renderScreen(<RoomDayScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Apuntar a alguien a este grupo' }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/new-appointment',
      params: { date: '2026-10-12', time: '17:00' },
    });
  });
});
