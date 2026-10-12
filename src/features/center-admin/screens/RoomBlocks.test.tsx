import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { getTodayIsoDate, zonedDateTimeToUtc } from '@/shared/lib/format';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { getDeviceTimeZone } from '../hooks/useCenterTimeZone';
import { NewRoomBlockScreen } from './NewRoomBlockScreen';
import { RoomBlocksScreen } from './RoomBlocksScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const ROOMS_PATH = `${CENTER_PATH}/rooms`;
const SETTINGS_PATH = CENTER_PATH;
const ROOM_ID = '0191d6a0-0000-7000-8000-0000000000f1';
const BLOCK_ID = '0191d6a0-0000-7000-8000-0000000000f9';
const BLOCKS_PATH = `${ROOMS_PATH}/${ROOM_ID}/blocks`;
const TIME_ZONE = 'Europe/Madrid';

const ROOMS = {
  rooms: [
    { id: ROOM_ID, name: 'Aula 2', capacity: 12, staff: null, fixedService: null, services: [] },
  ],
};

const BLOCKS = {
  blocks: [
    {
      id: BLOCK_ID,
      roomId: ROOM_ID,
      startsAt: '2026-10-17T08:00:00.000Z',
      endsAt: '2026-10-17T12:00:00.000Z',
      reason: 'rental',
      note: 'Asociación de vecinos',
      createdBy: { membershipId: 'owner', fullName: 'Carlos Núñez' },
    },
  ],
};

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('RoomBlocksScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ roomId: ROOM_ID });
  });

  it('lists the blocks of the room in its time zone and removes one after confirming', async () => {
    mockApi({
      [`GET ${ROOMS_PATH}`]: ROOMS,
      [`GET ${SETTINGS_PATH}`]: { timezone: TIME_ZONE },
      [`GET ${BLOCKS_PATH}`]: BLOCKS,
      [`DELETE ${BLOCKS_PATH}/${BLOCK_ID}`]: undefined,
    });
    renderScreen(<RoomBlocksScreen />);

    expect(await screen.findByText('sáb 17 oct · 10:00–14:00')).toBeOnTheScreen();
    expect(screen.getByText('Alquiler · Asociación de vecinos')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: /sáb 17 oct · 10:00–14:00, Alquiler/ }));
    fireEvent.press(await screen.findByRole('button', { name: 'Quitar bloqueo' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', `${BLOCKS_PATH}/${BLOCK_ID}`)).toBeDefined();
    });
  });

  it('opens the form for a new block', async () => {
    mockApi({
      [`GET ${ROOMS_PATH}`]: ROOMS,
      [`GET ${SETTINGS_PATH}`]: { timezone: TIME_ZONE },
      [`GET ${BLOCKS_PATH}`]: { blocks: [] },
    });
    renderScreen(<RoomBlocksScreen />);

    expect(await screen.findByText('Sin bloqueos en las próximas 8 semanas')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Nuevo bloqueo' }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/room-blocks/new/[roomId]',
      params: { roomId: ROOM_ID },
    });
  });
});

describe('NewRoomBlockScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ roomId: ROOM_ID });
  });

  it('sends the block as UTC instants of the local hours of the center', async () => {
    mockApi({
      [`GET ${SETTINGS_PATH}`]: { timezone: TIME_ZONE },
      [`POST ${BLOCKS_PATH}`]: { block: BLOCKS.blocks[0], cancelledSessionCount: 0 },
    });
    renderScreen(<NewRoomBlockScreen />);
    const today = getTodayIsoDate(new Date(), getDeviceTimeZone());

    fireEvent.press(screen.getByRole('radio', { name: 'Evento' }));
    fireEvent.changeText(screen.getByLabelText('Nota (opcional)'), 'Exhibición');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Bloquear' })).toBeEnabled();
    });
    fireEvent.press(screen.getByRole('button', { name: 'Bloquear' }));

    await waitFor(() => {
      expect(getMockRouter().back).toHaveBeenCalled();
    });
    expect(findApiCall('POST', BLOCKS_PATH)?.body).toEqual({
      startsAt: zonedDateTimeToUtc(today, '09:00', TIME_ZONE).toISOString(),
      endsAt: zonedDateTimeToUtc(today, '14:00', TIME_ZONE).toISOString(),
      reason: 'event',
      note: 'Exhibición',
    });
  });
});
