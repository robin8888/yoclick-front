import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { EditRoomScreen } from './EditRoomScreen';
import { ManagementScreen } from './ManagementScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const ROOMS_PATH = `/v1/centers/${NORTE_CENTER_ID}/rooms`;
const TEAM_PATH = `/v1/centers/${NORTE_CENTER_ID}/team`;
const ROOM_ANA_ID = '0191d6a0-0000-7000-8000-0000000000f1';
const ROOM_FREE_ID = '0191d6a0-0000-7000-8000-0000000000f2';
const TEACHER_ANA_ID = '0191d6a0-0000-7000-8000-0000000000b1';
const SALSA_ID = '0191d6a0-0000-7000-8000-0000000000a1';

const ROOMS = {
  rooms: [
    {
      id: ROOM_ANA_ID,
      name: 'Sala de baile',
      capacity: 12,
      staff: { membershipId: TEACHER_ANA_ID, fullName: 'Ana Ruiz' },
      fixedService: { id: SALSA_ID, name: 'Salsa' },
      services: [{ id: SALSA_ID, name: 'Salsa' }],
    },
    {
      id: ROOM_FREE_ID,
      name: 'Aula común',
      capacity: 6,
      staff: null,
      fixedService: null,
      services: [],
    },
  ],
};

const TEAM = {
  members: [
    {
      membershipId: TEACHER_ANA_ID,
      userId: 'user-ana',
      fullName: 'Ana Ruiz',
      email: 'ana@example.com',
      role: 'staff',
      status: 'active',
      staffTitle: null,
      photoUrl: null,
      permissions: [],
      joinedAt: '2026-01-01T09:00:00.000Z',
    },
  ],
};

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('ManagementScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('lists the rooms with their capacity and the teacher who gives class in each', async () => {
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS });
    renderScreen(<ManagementScreen />);

    expect(await screen.findAllByText('Sala de baile')).toHaveLength(2);
    expect(screen.getByText('Aforo 12 · Da clase Ana Ruiz · Solo Salsa')).toBeOnTheScreen();
    expect(screen.getAllByText('Aula común')).toHaveLength(2);
    expect(screen.getByText('Aforo 6 · Cualquiera del equipo')).toBeOnTheScreen();
  });

  it('explains what the rooms are for when there are none', async () => {
    mockApi({ [`GET ${ROOMS_PATH}`]: { rooms: [] } });
    renderScreen(<ManagementScreen />);

    expect(await screen.findByText('Aún no hay espacios')).toBeOnTheScreen();
  });

  it('opens the form to add a room', async () => {
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS });
    renderScreen(<ManagementScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Nuevo espacio' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/rooms/new');
  });

  it('offers to block a room for rental or maintenance from this screen', async () => {
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS });
    renderScreen(<ManagementScreen />);

    expect(await screen.findByText('Alquiler y mantenimiento')).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole('button', { name: /Sala de baile\. Bloquear horas por alquiler/ }),
    );

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/room-blocks/[roomId]',
      params: { roomId: ROOM_ANA_ID },
    });
  });

  it('opens a room to edit it', async () => {
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS });
    renderScreen(<ManagementScreen />);

    fireEvent.press(await screen.findByRole('button', { name: /Sala de baile, aforo 12/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/rooms/[roomId]',
      params: { roomId: ROOM_ANA_ID },
    });
  });
});

describe('EditRoomScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ roomId: ROOM_FREE_ID });
  });

  it('changes the teacher of the room and saves it', async () => {
    mockApi({
      [`GET ${ROOMS_PATH}`]: ROOMS,
      [`GET ${TEAM_PATH}`]: TEAM,
      [`PATCH ${ROOMS_PATH}/${ROOM_FREE_ID}`]: {
        ...ROOMS.rooms[1],
        staff: { membershipId: TEACHER_ANA_ID, fullName: 'Ana Ruiz' },
      },
    });
    renderScreen(<EditRoomScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Ana Ruiz' }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', `${ROOMS_PATH}/${ROOM_FREE_ID}`)?.body).toEqual({
        name: 'Aula común',
        capacity: 6,
        staffMembershipId: TEACHER_ANA_ID,
        serviceIds: [],
        serviceId: null,
      });
    });
  });

  it('says so when the room no longer exists', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ roomId: 'unknown' });
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS });
    renderScreen(<EditRoomScreen />);

    expect(await screen.findByText('Esa sala ya no existe')).toBeOnTheScreen();
  });
});
