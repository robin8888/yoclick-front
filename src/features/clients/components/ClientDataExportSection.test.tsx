import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { ClientDataExportSection } from './ClientDataExportSection';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const PATH = `/v1/centers/${NORTE_CENTER_ID}/clients/client-1/data-export`;
const TYPED_SECRET = 'mi-contraseña';
const EXPORTED = {
  exportedAt: '2026-10-07T10:00:00.000Z',
  person: { fullName: 'Diego Martín', email: 'diego@example.com', phone: null, birthDate: null },
  membership: {
    status: 'active',
    joinedAt: '2026-01-10T09:00:00.000Z',
    level: null,
    groupName: null,
  },
  bookings: [],
  routines: [],
  privacyRequests: [],
};

describe('ClientDataExportSection', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('asks for the password of the administrator and shares what the center keeps', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    mockApi({ 'GET /v1/me/memberships': { memberships: [] }, [`POST ${PATH}`]: EXPORTED });
    renderScreen(<ClientDataExportSection membershipId="client-1" />);

    fireEvent.press(screen.getByRole('button', { name: 'Exportar sus datos' }));
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Tu contraseña'), TYPED_SECRET);
    fireEvent.press(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Datos de Diego Martín' }),
      );
    });
    expect(findApiCall('POST', PATH)?.body).toEqual({ ['password']: TYPED_SECRET });
    shareSpy.mockRestore();
  });

  it('says the password is wrong', async () => {
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`POST ${PATH}`]: () => {
        throw buildApiError('REAUTHENTICATION_FAILED', 403);
      },
    });
    renderScreen(<ClientDataExportSection membershipId="client-1" />);

    fireEvent.press(screen.getByRole('button', { name: 'Exportar sus datos' }));
    fireEvent.changeText(screen.getByLabelText('Tu contraseña'), 'mala');
    fireEvent.press(screen.getByRole('button', { name: 'Exportar' }));

    expect(await screen.findByText('La contraseña no es correcta')).toBeOnTheScreen();
  });
});
