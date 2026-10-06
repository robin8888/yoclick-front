import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { getSectorVocabulary } from '@/shared/i18n';
import { NORTE_CENTER_ID } from '@/test/factories';
import { getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { ClientsScreen } from './ClientsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

// Sin sector cargado se usa el vocabulario por defecto: el nivel intermedio se llama así en pantalla.
const INTERMEDIATE_LEVEL_WORD = getSectorVocabulary(undefined).levels[1];

const CLIENTS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/clients`;
const GROUPS_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/groups`;

function buildClient(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    membershipId: '0191d6a0-0000-7000-8000-0000000000d1',
    fullName: 'Marta Ruiz',
    email: 'marta@example.com',
    status: 'active',
    activity: 'active',
    level: 'intermediate',
    group: { id: '0191d6a0-0000-7000-8000-0000000000e1', name: 'Mañanas' },
    joinedAt: '2026-01-10T09:00:00.000Z',
    bookingCount: 12,
    lastBookingAt: '2026-10-03T09:00:00.000Z',
    ...overrides,
  };
}

const CLIENT_LIST = {
  totalClientCount: 212,
  matchingCount: 2,
  clients: [
    buildClient({}),
    buildClient({
      membershipId: '0191d6a0-0000-7000-8000-0000000000d2',
      fullName: 'Luis Pardo',
      activity: 'inactive',
      level: null,
      group: null,
    }),
  ],
};

const GROUP_LIST = {
  groups: [
    {
      id: '0191d6a0-0000-7000-8000-0000000000e1',
      name: 'Mañanas',
      level: 'intermediate',
      instructor: {
        membershipId: '0191d6a0-0000-7000-8000-0000000000b1',
        fullName: 'Lucía Ferrer',
      },
      memberCount: 9,
    },
  ],
};

describe('ClientsScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('lists the clients with level, group and status as a word, and counts both tabs', async () => {
    mockApi({ [CLIENTS_PATH]: CLIENT_LIST, [GROUPS_PATH]: GROUP_LIST });
    renderScreen(<ClientsScreen />);

    expect(await screen.findByText('Marta Ruiz')).toBeOnTheScreen();
    expect(screen.getByText(`${INTERMEDIATE_LEVEL_WORD} · Grupo: Mañanas`)).toBeOnTheScreen();
    expect(screen.getByText('Sin nivel · Grupo: —')).toBeOnTheScreen();
    expect(screen.getByText('Inactivo 30 d')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: /Clientes \(212\)/ })).toBeOnTheScreen();
    expect(await screen.findByRole('tab', { name: /Grupos \(1\)/ })).toBeOnTheScreen();
  });

  it('searches by name and filters by status on the server', async () => {
    mockApi({ [CLIENTS_PATH]: CLIENT_LIST, [GROUPS_PATH]: GROUP_LIST });
    renderScreen(<ClientsScreen />);
    await screen.findByText('Marta Ruiz');

    fireEvent.changeText(screen.getByLabelText('Buscar por nombre o correo'), 'luis');
    fireEvent.press(screen.getByRole('button', { name: 'Inactivos' }));

    await waitFor(() => {
      expect(
        getRecordedApiCalls().some(
          (call) => call.path.includes('search=luis') && call.path.includes('status=inactive'),
        ),
      ).toBe(true);
    });
  });

  it('says nobody matches when a search finds no one', async () => {
    mockApi({
      [CLIENTS_PATH]: { totalClientCount: 3, matchingCount: 0, clients: [] },
      [GROUPS_PATH]: GROUP_LIST,
    });
    renderScreen(<ClientsScreen />);
    fireEvent.changeText(screen.getByLabelText('Buscar por nombre o correo'), 'zzz');

    expect(await screen.findByText('Nadie coincide con la búsqueda')).toBeOnTheScreen();
  });

  it('opens the client file when a row is tapped', async () => {
    mockApi({ [CLIENTS_PATH]: CLIENT_LIST, [GROUPS_PATH]: GROUP_LIST });
    renderScreen(<ClientsScreen />);

    fireEvent.press(await screen.findByRole('button', { name: /Marta Ruiz/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/clients/[membershipId]',
      params: { membershipId: '0191d6a0-0000-7000-8000-0000000000d1' },
    });
  });

  it('shows the groups with their members, instructor and level', async () => {
    mockApi({ [CLIENTS_PATH]: CLIENT_LIST, [GROUPS_PATH]: GROUP_LIST });
    renderScreen(<ClientsScreen />);
    await screen.findByText('Marta Ruiz');

    fireEvent.press(await screen.findByRole('tab', { name: /Grupos \(1\)/ }));

    expect(await screen.findByText('Mañanas')).toBeOnTheScreen();
    expect(
      screen.getByText(`9 personas · Lucía Ferrer · ${INTERMEDIATE_LEVEL_WORD}`),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Crear grupo' })).toBeOnTheScreen();
  });
});
