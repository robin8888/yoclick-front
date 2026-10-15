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

  it('has one button for each thing to create: room, service and class', async () => {
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS });
    renderScreen(<ManagementScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Crear y editar sala' }));
    fireEvent.press(screen.getByRole('button', { name: 'Crear y editar servicio' }));
    fireEvent.press(screen.getByRole('button', { name: 'Crear clase' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/rooms/new');
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/services/[serviceId]',
      params: { serviceId: 'new' },
    });
    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/schedules/new');
  });

  it('no longer shows the rental and maintenance or the fixed schedule sections', async () => {
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS });
    renderScreen(<ManagementScreen />);

    expect(await screen.findByRole('button', { name: 'Crear y editar sala' })).toBeOnTheScreen();
    expect(screen.queryByText('Editar salas')).toBeNull();
    expect(screen.queryByText('Alquiler y mantenimiento')).toBeNull();
    expect(screen.queryByText('Horario fijo')).toBeNull();
  });
});

describe('EditRoomScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ roomId: ROOM_FREE_ID });
  });

  it('only edits the name and capacity of the room and clears its old fixed teacher and service', async () => {
    mockApi({
      [`GET ${ROOMS_PATH}`]: ROOMS,
      [`PATCH ${ROOMS_PATH}/${ROOM_FREE_ID}`]: ROOMS.rooms[1],
    });
    renderScreen(<EditRoomScreen />);

    fireEvent.changeText(await screen.findByLabelText('Aforo máximo'), '8');
    expect(screen.queryByRole('button', { name: 'Ana Ruiz' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', `${ROOMS_PATH}/${ROOM_FREE_ID}`)?.body).toEqual({
        name: 'Aula común',
        capacity: 8,
        staffMembershipId: null,
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
