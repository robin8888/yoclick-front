import { act, fireEvent, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildBooking } from '@/test/booking-factories';
import { buildMembership, NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { ClientHomeScreen } from './ClientHomeScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const LIST_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/bookings/mine`;

describe('ClientHomeScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().startSession({
        accessToken: 'token',
        user: { id: 'user-1', email: 'leti@yopmail.com', fullName: 'Leticia Duarte Duate' },
      });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('greets the person by first name and shows the center', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [] },
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(screen.getByRole('heading', { name: 'Hola, Leticia' })).toBeOnTheScreen();
    expect(await screen.findByText('Cliente')).toBeOnTheScreen();
  });

  it('shows the next appointment', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [buildBooking()] },
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(await screen.findByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.getByText('jue 8 oct · 18:00')).toBeOnTheScreen();
    expect(await screen.findByText('Cliente')).toBeOnTheScreen();
  });

  it('says there is no next appointment and offers to book', async () => {
    mockApi({
      [LIST_PATH]: { bookings: [] },
      'GET /v1/me/memberships': { memberships: [buildMembership()] },
    });
    renderScreen(<ClientHomeScreen />);

    expect(await screen.findByText('No tienes ninguna cita próxima.')).toBeOnTheScreen();
    expect(await screen.findByText('Cliente')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Agendar cita' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/(tabs)/book');
  });
});
