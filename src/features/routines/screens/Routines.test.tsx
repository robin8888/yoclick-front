import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { PracticeScreen } from '@/features/practice';
import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { NewRoutineScreen } from './NewRoutineScreen';
import { RoutineDetailScreen } from './RoutineDetailScreen';
import { RoutinesScreen } from './RoutinesScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const BASE = `/v1/centers/${NORTE_CENTER_ID}`;
const ROUTINE_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789ab';
const ASSIGNMENT_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789ac';
const CREATED_AT = '2026-10-07T10:00:00.000Z';
const OWNER_MEMBERSHIPS = {
  memberships: [
    { membershipId: 'm1', centerId: NORTE_CENTER_ID, role: 'owner', center: { sectorId: 'gym' } },
  ],
};
const CLIENT_MEMBERSHIPS = {
  memberships: [
    { membershipId: 'm1', centerId: NORTE_CENTER_ID, role: 'client', center: { sectorId: 'gym' } },
  ],
};
const LIBRARY = {
  exercises: [
    { name: 'Sentadilla goblet', category: 'Piernas' },
    { name: 'Plancha frontal', category: 'Core' },
  ],
};
const DETAIL = {
  id: ROUTINE_ID,
  name: 'Fuerza base',
  note: 'Descansa 90 s entre series.',
  items: [{ name: 'Sentadilla goblet', category: 'Piernas', prescription: '4 × 10', video: null }],
  assignments: [
    { id: ASSIGNMENT_ID, kind: 'group', targetName: 'Fuerza 50+', assignedAt: CREATED_AT },
  ],
  createdAt: CREATED_AT,
};
const READY_VIDEO = {
  id: 'video-1',
  title: 'Sentadilla goblet paso a paso',
  status: 'ready',
  reviewStatus: 'approved',
  reviewNote: null,
  durationSeconds: 372,
  playback: {
    streamUrl: 'https://video.example/video-1/playlist.m3u8',
    thumbnailUrl: 'https://video.example/video-1/thumbnail.jpg',
    expiresAt: '2026-10-07T14:00:00.000Z',
  },
};
const PLAN_WITHOUT_VIDEO = { isIncluded: false, limitBytes: null, usedBytes: 0 };
const PLAN_WITH_VIDEO = { isIncluded: true, limitBytes: 5_368_709_120, usedBytes: 0 };
const LIST_ITEM = {
  id: ROUTINE_ID,
  name: 'Fuerza base',
  itemCount: 5,
  assignmentCount: 2,
  createdAt: CREATED_AT,
};

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('RoutinesScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('lists the routines with their exercises and assignments, in the words of the sector', async () => {
    mockApi({
      'GET /v1/me/memberships': OWNER_MEMBERSHIPS,
      [`GET ${BASE}/routines`]: { routines: [LIST_ITEM] },
    });
    renderScreen(<RoutinesScreen routeBase="/(admin)/routines" />);

    expect(await screen.findByText('Fuerza base')).toBeOnTheScreen();
    expect(screen.getByText('5 ejercicios · 2 asignaciones')).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Rutinas' })).toBeOnTheScreen();
  });

  it('explains an empty list and offers to create the first one', async () => {
    mockApi({
      'GET /v1/me/memberships': OWNER_MEMBERSHIPS,
      [`GET ${BASE}/routines`]: { routines: [] },
    });
    renderScreen(<RoutinesScreen routeBase="/(staff)/routines" />);

    expect(await screen.findByText('Todavía no hay rutinas')).toBeOnTheScreen();
    fireEvent.press(screen.getAllByRole('button', { name: 'Crear rutina' })[0] as never);

    expect(getMockRouter().push).toHaveBeenCalledWith('/(staff)/routines/new');
  });

  it('opens a routine when its card is tapped', async () => {
    mockApi({
      'GET /v1/me/memberships': OWNER_MEMBERSHIPS,
      [`GET ${BASE}/routines`]: { routines: [LIST_ITEM] },
    });
    renderScreen(<RoutinesScreen routeBase="/(admin)/routines" />);

    fireEvent.press(await screen.findByRole('button', { name: /Fuerza base/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith(`/(admin)/routines/${ROUTINE_ID}`);
  });
});

describe('NewRoutineScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
    mockApi({
      'GET /v1/me/memberships': OWNER_MEMBERSHIPS,
      [`GET ${BASE}/exercise-library`]: LIBRARY,
      [`GET ${BASE}/video-plan`]: PLAN_WITHOUT_VIDEO,
      [`POST ${BASE}/routines`]: DETAIL,
    });
  });

  it('builds a routine from the library and a custom exercise, and saves it', async () => {
    renderScreen(<NewRoutineScreen />);
    fireEvent.changeText(await screen.findByLabelText('Nombre'), 'Fuerza base');
    fireEvent.press(await screen.findByRole('button', { name: 'Añadir Sentadilla goblet' }));
    fireEvent.changeText(screen.getByLabelText('Cuánto: Sentadilla goblet'), '4 × 10');
    fireEvent.changeText(screen.getByLabelText('Ejercicio propio'), 'Mi ejercicio');
    fireEvent.press(screen.getByRole('button', { name: 'Añadir' }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/routines`)?.body).toEqual({
        name: 'Fuerza base',
        note: null,
        items: [
          { name: 'Sentadilla goblet', category: 'Piernas', prescription: '4 × 10', videoId: null },
          { name: 'Mi ejercicio', category: null, prescription: null, videoId: null },
        ],
      });
    });
  });

  it('filters the library by category', async () => {
    renderScreen(<NewRoutineScreen />);
    await screen.findByRole('button', { name: 'Añadir Sentadilla goblet' });

    fireEvent.press(screen.getByRole('radio', { name: 'Core' }));

    expect(screen.queryByRole('button', { name: 'Añadir Sentadilla goblet' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Añadir Plancha frontal' })).toBeOnTheScreen();
  });

  it('cannot be saved without a name and an exercise', async () => {
    renderScreen(<NewRoutineScreen />);

    expect(await screen.findByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('marks an exercise as added and counts it', async () => {
    renderScreen(<NewRoutineScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Añadir Sentadilla goblet' }));

    expect(screen.getByRole('button', { name: 'Sentadilla goblet, ya añadido' })).toBeOnTheScreen();
    expect(screen.getByText('Ejercicios (1)')).toBeOnTheScreen();
  });

  it('says it will assign when saving once a group is chosen', async () => {
    mockApi({
      'GET /v1/me/memberships': OWNER_MEMBERSHIPS,
      [`GET ${BASE}/exercise-library`]: LIBRARY,
      [`GET ${BASE}/groups`]: {
        groups: [{ id: 'g1', name: 'Fuerza 50+', memberCount: 3, level: null, instructor: null }],
      },
    });
    renderScreen(<NewRoutineScreen />);
    await screen.findByRole('button', { name: 'Añadir Sentadilla goblet' });

    fireEvent.press(screen.getByRole('tab', { name: 'Un grupo' }));
    fireEvent.press(await screen.findByText('Fuerza 50+'));

    expect(screen.getByRole('button', { name: 'Guardar y asignar' })).toBeOnTheScreen();
  });

  it('does not offer videos when the plan does not include them', async () => {
    renderScreen(<NewRoutineScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Añadir Sentadilla goblet' }));

    await waitFor(() => {
      expect(findApiCall('GET', `${BASE}/video-plan`)).toBeDefined();
    });
    expect(screen.queryByRole('button', { name: /Añadir vídeo/ })).toBeNull();
  });

  it('offers to add a video to each exercise when the plan includes them', async () => {
    mockApi({
      'GET /v1/me/memberships': OWNER_MEMBERSHIPS,
      [`GET ${BASE}/exercise-library`]: LIBRARY,
      [`GET ${BASE}/video-plan`]: PLAN_WITH_VIDEO,
    });
    renderScreen(<NewRoutineScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Añadir Sentadilla goblet' }));

    expect(
      await screen.findByRole('button', { name: 'Añadir vídeo: Sentadilla goblet' }),
    ).toBeOnTheScreen();
  });
});

describe('RoutineDetailScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
    jest.mocked(useLocalSearchParams).mockReturnValue({ routineId: ROUTINE_ID });
    mockApi({
      'GET /v1/me/memberships': OWNER_MEMBERSHIPS,
      [`GET ${BASE}/routines/${ROUTINE_ID}`]: DETAIL,
      [`DELETE ${BASE}/routines/${ROUTINE_ID}/assignments/${ASSIGNMENT_ID}`]: null,
      [`DELETE ${BASE}/routines/${ROUTINE_ID}`]: null,
    });
  });

  it('shows the exercises, the note and who has it', async () => {
    renderScreen(<RoutineDetailScreen />);

    expect(await screen.findByText('Sentadilla goblet')).toBeOnTheScreen();
    expect(screen.getByText('Descansa 90 s entre series.')).toBeOnTheScreen();
    expect(screen.getByText('Grupo Fuerza 50+')).toBeOnTheScreen();
  });

  it('plays the video of an exercise', async () => {
    mockApi({
      'GET /v1/me/memberships': OWNER_MEMBERSHIPS,
      [`GET ${BASE}/routines/${ROUTINE_ID}`]: {
        ...DETAIL,
        items: [{ ...DETAIL.items[0], video: READY_VIDEO }],
      },
    });
    renderScreen(<RoutineDetailScreen />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Reproducir Sentadilla goblet paso a paso' }),
    );

    expect(screen.getByLabelText('Vídeo: Sentadilla goblet paso a paso')).toBeOnTheScreen();
  });

  it('removes an assignment', async () => {
    renderScreen(<RoutineDetailScreen />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Quitar la asignación de Grupo Fuerza 50+' }),
    );

    await waitFor(() => {
      expect(
        findApiCall('DELETE', `${BASE}/routines/${ROUTINE_ID}/assignments/${ASSIGNMENT_ID}`),
      ).toBeDefined();
    });
  });

  it('asks before archiving', async () => {
    renderScreen(<RoutineDetailScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Archivar' }));
    expect(await screen.findByText('¿Archivar?')).toBeOnTheScreen();
    expect(findApiCall('DELETE', `${BASE}/routines/${ROUTINE_ID}`)).toBeUndefined();
    fireEvent.press(screen.getByRole('button', { name: 'Sí, archivar' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', `${BASE}/routines/${ROUTINE_ID}`)).toBeDefined();
    });
  });
});

describe('PracticeScreen (client)', () => {
  beforeEach(() => {
    signIn();
  });

  it('shows what the center assigned, with the exercises', async () => {
    mockApi({
      'GET /v1/me/memberships': CLIENT_MEMBERSHIPS,
      [`GET ${BASE}/my-routines`]: { routines: [{ ...DETAIL, assignedAt: CREATED_AT }] },
    });
    renderScreen(<PracticeScreen />);

    expect(await screen.findByText('Fuerza base')).toBeOnTheScreen();
    expect(screen.getByText('Recibida el 07/10/2026')).toBeOnTheScreen();
    expect(screen.getByText('Sentadilla goblet')).toBeOnTheScreen();
  });

  it('explains there is nothing assigned yet', async () => {
    mockApi({
      'GET /v1/me/memberships': CLIENT_MEMBERSHIPS,
      [`GET ${BASE}/my-routines`]: { routines: [] },
    });
    renderScreen(<PracticeScreen />);

    expect(await screen.findByText('Todavía no tienes nada asignado')).toBeOnTheScreen();
  });
});
