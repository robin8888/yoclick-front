import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildService, SERVICE_ID, STAFF_MEMBERSHIP_ID } from '@/test/booking-factories';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { InviteTeamScreen } from './InviteTeamScreen';
import { ServiceEditorScreen } from './ServiceEditorScreen';
import { ServicesScreen } from './ServicesScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SERVICES_PATH = `/v1/centers/${NORTE_CENTER_ID}/services`;
const SETTINGS_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const TEAM_PATH = `/v1/centers/${NORTE_CENTER_ID}/team`;
const INVITATIONS_PATH = `/v1/centers/${NORTE_CENTER_ID}/invitations`;
const OPENING_HOURS = {
  mon: [{ opensAt: '07:00', closesAt: '21:00' }],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
};

const TEAM_MEMBERS = [
  {
    membershipId: STAFF_MEMBERSHIP_ID,
    userId: 'user-alex',
    fullName: 'Álex Moreno',
    email: 'alex@example.com',
    role: 'staff',
    status: 'active',
    staffTitle: 'Entrenador',
    permissions: [],
    joinedAt: '2026-01-01T09:00:00.000Z',
  },
  {
    membershipId: '0191d6a0-0000-7000-8000-0000000000b2',
    userId: 'user-lucia',
    fullName: 'Lucía Ferrer',
    email: 'lucia@example.com',
    role: 'staff',
    status: 'active',
    staffTitle: null,
    permissions: [],
    joinedAt: '2026-02-01T09:00:00.000Z',
  },
];

function signInAsOwner(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('ServicesScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
  });

  it('lists the services with duration and price and shows the opening hours', async () => {
    mockApi({
      [`GET ${SERVICES_PATH}`]: { services: [buildService()] },
      [`GET ${SETTINGS_PATH}`]: { name: 'Studio Norte', openingHours: OPENING_HOURS },
    });
    renderScreen(<ServicesScreen />);

    expect(await screen.findByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.getByText('1 h · 35 €')).toBeOnTheScreen();
    expect(await screen.findByText('07:00–21:00')).toBeOnTheScreen();
    expect(screen.getAllByText('Cerrado')).toHaveLength(6);
  });

  it('opens the editor of a tapped service and the empty editor for a new one', async () => {
    mockApi({
      [`GET ${SERVICES_PATH}`]: { services: [buildService()] },
      [`GET ${SETTINGS_PATH}`]: { openingHours: OPENING_HOURS },
    });
    renderScreen(<ServicesScreen />);

    fireEvent.press(await screen.findByRole('button', { name: /Entrenamiento personal/ }));
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/services/[serviceId]',
      params: { serviceId: SERVICE_ID },
    });

    fireEvent.press(screen.getByRole('button', { name: 'Nuevo servicio' }));
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/services/[serviceId]',
      params: { serviceId: 'new' },
    });
  });

  it('offers to create the first service when there are none', async () => {
    mockApi({
      [`GET ${SERVICES_PATH}`]: { services: [] },
      [`GET ${SETTINGS_PATH}`]: { openingHours: OPENING_HOURS },
    });
    renderScreen(<ServicesScreen />);

    expect(await screen.findByText('Aún no tienes servicios')).toBeOnTheScreen();
  });

  it('shows an error with retry when the catalog cannot be loaded', async () => {
    mockApi({
      [`GET ${SERVICES_PATH}`]: () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<ServicesScreen />);

    expect(await screen.findByText('No hemos podido cargar los servicios')).toBeOnTheScreen();
  });
});

describe('ServiceEditorScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
    jest.mocked(useLocalSearchParams).mockReturnValue({ serviceId: 'new' });
  });

  it('requires a name before creating the service', async () => {
    mockApi({ [`GET ${SERVICES_PATH}`]: { services: [] } });
    renderScreen(<ServiceEditorScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Escribe el nombre del servicio')).toBeOnTheScreen();
    expect(findApiCall('POST', SERVICES_PATH)).toBeUndefined();
  });

  it('creates a service with the chosen duration and price and goes back', async () => {
    mockApi({
      [`GET ${SERVICES_PATH}`]: { services: [] },
      [`POST ${SERVICES_PATH}`]: buildService(),
    });
    renderScreen(<ServiceEditorScreen />);
    fireEvent.changeText(screen.getByLabelText('Nombre del servicio'), 'Valoración inicial');
    fireEvent.press(screen.getByRole('button', { name: '30 min' }));
    fireEvent.changeText(screen.getByLabelText('Precio en euros (opcional)'), '25,5');

    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(getMockRouter().back).toHaveBeenCalled();
    });
    expect(findApiCall('POST', SERVICES_PATH)?.body).toEqual({
      name: 'Valoración inicial',
      durationMinutes: 30,
      priceCents: 2550,
      isVisible: true,
    });
  });

  it('lets the owner choose who gives the service and sends it', async () => {
    mockApi({
      [`GET ${SERVICES_PATH}`]: { services: [] },
      [`GET ${TEAM_PATH}`]: { members: TEAM_MEMBERS },
      [`POST ${SERVICES_PATH}`]: buildService(),
    });
    renderScreen(<ServiceEditorScreen />);
    fireEvent.changeText(screen.getByLabelText('Nombre del servicio'), 'Valoración inicial');

    fireEvent.press(await screen.findByRole('checkbox', { name: 'Lucía Ferrer' }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(getMockRouter().back).toHaveBeenCalled();
    });
    expect(findApiCall('POST', SERVICES_PATH)?.body).toMatchObject({
      staffMembershipIds: ['0191d6a0-0000-7000-8000-0000000000b2'],
    });
  });

  it('shows who already gives an existing service and will not leave it with nobody', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ serviceId: SERVICE_ID });
    mockApi({
      [`GET ${SERVICES_PATH}`]: { services: [buildService()] },
      [`GET ${TEAM_PATH}`]: { members: TEAM_MEMBERS },
    });
    renderScreen(<ServiceEditorScreen />);

    const currentStaffCheckbox = await screen.findByRole('checkbox', {
      name: 'Álex Moreno. Entrenador',
    });
    expect(currentStaffCheckbox).toBeChecked();
    fireEvent.press(currentStaffCheckbox);
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Elige al menos una persona')).toBeOnTheScreen();
    expect(findApiCall('PATCH', `${SERVICES_PATH}/${SERVICE_ID}`)).toBeUndefined();
  });

  it('archives an existing service', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ serviceId: SERVICE_ID });
    mockApi({
      [`GET ${SERVICES_PATH}`]: { services: [buildService()] },
      [`DELETE ${SERVICES_PATH}/${SERVICE_ID}`]: null,
    });
    renderScreen(<ServiceEditorScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Archivar servicio' }));

    await waitFor(() => {
      expect(getMockRouter().back).toHaveBeenCalled();
    });
  });

  it('goes back to the list when the route parameter is not valid', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ serviceId: 'x' });
    mockApi({});
    renderScreen(<ServiceEditorScreen />);

    expect(screen.getByText('redirect:/(admin)/services')).toBeOnTheScreen();
  });
});

describe('InviteTeamScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
  });

  it('invites an instructor by email and lists the pending invitations', async () => {
    mockApi({
      [`GET ${INVITATIONS_PATH}`]: {
        invitations: [
          {
            id: 'inv-1',
            email: 'laura@verticetc.es',
            role: 'staff',
            expiresAt: '2026-10-20T10:00:00.000Z',
            createdAt: '2026-10-05T10:00:00.000Z',
          },
        ],
      },
      [`POST ${INVITATIONS_PATH}`]: { id: 'inv-2', email: 'dani@verticetc.es', role: 'staff' },
    });
    renderScreen(<InviteTeamScreen />);
    expect(await screen.findByText('laura@verticetc.es')).toBeOnTheScreen();

    fireEvent.changeText(screen.getByLabelText('Correo del instructor'), 'dani@verticetc.es');
    fireEvent.press(screen.getByRole('button', { name: 'Añadir' }));

    await waitFor(() => {
      expect(findApiCall('POST', INVITATIONS_PATH)?.body).toEqual({
        email: 'dani@verticetc.es',
        role: 'staff',
      });
    });
  });

  it('rejects an email that is not valid without calling the server', async () => {
    mockApi({ [`GET ${INVITATIONS_PATH}`]: { invitations: [] } });
    renderScreen(<InviteTeamScreen />);

    fireEvent.changeText(screen.getByLabelText('Correo del instructor'), 'dani');
    fireEvent.press(screen.getByRole('button', { name: 'Añadir' }));

    expect(await screen.findByText('El correo no parece válido')).toBeOnTheScreen();
    expect(findApiCall('POST', INVITATIONS_PATH)).toBeUndefined();
  });
});
