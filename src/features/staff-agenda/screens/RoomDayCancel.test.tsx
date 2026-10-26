import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { renderScreen } from '@/test/render-screen';

import { RoomDayScreen } from './RoomDayScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const ROOM_ID = '0191d6a0-0000-7000-8000-0000000000f1';
const SESSION_ID = '0191d6a0-0000-7000-8000-0000000000e1';
const ROOMS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/agenda/rooms`;
const CANCEL_PATH = `/v1/centers/${NORTE_CENTER_ID}/sessions/${SESSION_ID}/cancel`;
const MOVE_PATH = `/v1/centers/${NORTE_CENTER_ID}/sessions/${SESSION_ID}/move`;

const SESSION = {
  id: SESSION_ID,
  startsAt: '2026-10-12T15:00:00.000Z',
  endsAt: '2026-10-12T16:30:00.000Z',
  mode: 'group',
  capacity: 12,
  bookedCount: 1,
  service: { id: 'service-english', name: 'Inglés B1', color: null },
  teacher: { membershipId: 'staff-ana', fullName: 'Ana Ruiz' },
  schedule: { seriesId: 'series-1', label: 'Grupo de tarde' },
  location: null,
  cancelledReason: null,
  attendees: [
    {
      bookingId: 'booking-1',
      clientMembershipId: 'client-1',
      fullName: 'Marta Ruiz',
      status: 'confirmed',
      source: 'enrollment',
    },
  ],
};

const AGENDA = {
  date: '2026-10-12',
  timezone: 'Europe/Madrid',
  openingRanges: [{ opensAt: '09:00', closesAt: '21:00' }],
  rooms: [
    {
      id: ROOM_ID,
      name: 'Aula 2',
      capacity: 12,
      staff: null,
      sessions: [SESSION],
    },
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

describe('RoomDayScreen · fixed schedules', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ roomId: ROOM_ID, date: '2026-10-12' });
  });

  it('shows the group name and who comes from the fixed group', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA });
    renderScreen(<RoomDayScreen />);

    expect(await screen.findByText('Grupo de tarde')).toBeOnTheScreen();
    expect(screen.getByText('Marta Ruiz · grupo fijo')).toBeOnTheScreen();
  });

  it('cancels the class of that day with a reason', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA, [`POST ${CANCEL_PATH}`]: { affectedBookingCount: 1 } });
    renderScreen(<RoomDayScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Cancelar este día' }));
    fireEvent.changeText(await screen.findByLabelText('Motivo'), 'Profesora enferma');
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar la clase' }));

    await waitFor(() => {
      expect(findApiCall('POST', CANCEL_PATH)?.body).toEqual({ reason: 'Profesora enferma' });
    });
  });

  it('shows where the class is when it is held outside the center', async () => {
    mockApi({
      [ROOMS_PATH]: {
        ...AGENDA,
        rooms: [
          {
            ...AGENDA.rooms[0],
            sessions: [
              {
                ...SESSION,
                location: {
                  name: 'Auditorio Municipal',
                  address: null,
                  latitude: null,
                  longitude: null,
                },
              },
            ],
          },
        ],
      },
    });
    renderScreen(<RoomDayScreen />);

    expect(await screen.findByText('Lugar: Auditorio Municipal')).toBeOnTheScreen();
  });

  it('moves only that day to another hour, keeping the day it already had', async () => {
    mockApi({ [ROOMS_PATH]: AGENDA, [`POST ${MOVE_PATH}`]: { notifiedPersonCount: 2 } });
    renderScreen(<RoomDayScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Cambiar este día' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Guardar los cambios' }));

    await waitFor(() => {
      expect(findApiCall('POST', MOVE_PATH)?.body).toEqual({
        date: '2026-10-12',
        startsAtTime: '17:00',
        endsAtTime: '18:30',
      });
    });
  });

  it('offers no way to edit or move a day of a class that was not born from a schedule', async () => {
    mockApi({
      [ROOMS_PATH]: {
        ...AGENDA,
        rooms: [{ ...AGENDA.rooms[0], sessions: [{ ...SESSION, schedule: null }] }],
      },
    });
    renderScreen(<RoomDayScreen />);

    expect(await screen.findByRole('button', { name: 'Cancelar este día' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cambiar este día' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Editar horario' })).not.toBeOnTheScreen();
  });

  it('says why a day was cancelled instead of offering to cancel it again', async () => {
    mockApi({
      [ROOMS_PATH]: {
        ...AGENDA,
        rooms: [
          { ...AGENDA.rooms[0], sessions: [{ ...SESSION, cancelledReason: 'Festivo local' }] },
        ],
      },
    });
    renderScreen(<RoomDayScreen />);

    expect(await screen.findByText('Cancelada: Festivo local')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cancelar este día' })).not.toBeOnTheScreen();
  });
});
