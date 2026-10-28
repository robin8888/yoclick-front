import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking, Share } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { DeleteAccountScreen } from './DeleteAccountScreen';
import { PrivacySettingsScreen } from './PrivacySettingsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('@/shared/auth/useSignOutFlow', () => ({
  useSignOutFlow: jest.fn(() => ({ signOut: jest.fn(), isSigningOut: false, isSignedIn: true })),
}));

const TYPED_SECRET = 'mi-contraseña';
const BASE = `/v1/centers/${NORTE_CENTER_ID}`;
const MEMBERSHIPS = {
  memberships: [
    { membershipId: 'm1', centerId: NORTE_CENTER_ID, role: 'client', center: { sectorId: 'gym' } },
  ],
};
const OWNER_MEMBERSHIPS = {
  memberships: [
    {
      membershipId: 'm9',
      centerId: NORTE_CENTER_ID,
      role: 'owner',
      center: { name: 'Gimnasio Norte', sectorId: 'gym' },
    },
  ],
};
const CONSENTS = {
  consents: [
    { kind: 'privacy', version: '1', isGranted: true, grantedAt: '2026-10-01T10:00:00.000Z' },
    { kind: 'marketing', version: '1', isGranted: false, grantedAt: '2026-10-01T10:00:00.000Z' },
    { kind: 'image', version: '1', isGranted: true, grantedAt: '2026-10-01T10:00:00.000Z' },
  ],
};

function buildRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'request-1',
    clientMembershipId: 'm1',
    clientName: 'Ana Pérez',
    kind: 'access',
    status: 'open',
    message: null,
    dueAt: '2026-10-25T10:00:00.000Z',
    createdAt: '2026-09-25T10:00:00.000Z',
    resolvedAt: null,
    resolutionNote: null,
    ...overrides,
  };
}

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

function mockPrivacyApi(extra: Record<string, unknown> = {}, requests: unknown[] = []): void {
  mockApi({
    'GET /v1/me/memberships': MEMBERSHIPS,
    'GET /v1/me/consents': CONSENTS,
    [`GET ${BASE}/privacy-requests/mine`]: { requests },
    ...extra,
  });
}

describe('PrivacySettingsScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('shows the consents: privacy is fixed and the others can be changed', async () => {
    mockPrivacyApi();
    renderScreen(<PrivacySettingsScreen />);

    expect(await screen.findByText('Tus consentimientos')).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Privacidad y condiciones' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Promociones y novedades' })).not.toBeDisabled();
  });

  it('links to the privacy policy and the terms, opened in the browser (Apple 5.1.1(i))', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockPrivacyApi();
    renderScreen(<PrivacySettingsScreen />);

    fireEvent.press(await screen.findByRole('link', { name: 'Política de privacidad' }));
    fireEvent.press(screen.getByRole('link', { name: 'Condiciones del servicio' }));

    expect(openUrl).toHaveBeenNthCalledWith(1, 'https://yoclick.app/privacidad');
    expect(openUrl).toHaveBeenNthCalledWith(2, 'https://yoclick.app/condiciones');
    openUrl.mockRestore();
  });

  it('publishes a contact address that opens the mail app (Apple 1.2)', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockPrivacyApi();
    renderScreen(<PrivacySettingsScreen />);

    fireEvent.press(await screen.findByRole('link', { name: 'Contacto' }));

    expect(openUrl).toHaveBeenCalledWith('mailto:soporte@yoclick.app');
    openUrl.mockRestore();
  });

  it('says so when the browser cannot open a legal text', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no browser'));
    mockPrivacyApi();
    renderScreen(<PrivacySettingsScreen />);

    fireEvent.press(await screen.findByRole('link', { name: 'Política de privacidad' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/No hemos podido abrir el enlace/);
    openUrl.mockRestore();
  });

  it('credits the OpenStreetMap and Geoapify data behind the address suggestions', async () => {
    mockPrivacyApi();
    renderScreen(<PrivacySettingsScreen />);

    expect(await screen.findByText(/OpenStreetMap contributors, licencia ODbL/)).toBeOnTheScreen();
  });

  it('withdraws and grants an optional consent', async () => {
    mockPrivacyApi({
      'PUT /v1/me/consents': {
        consents: [
          ...CONSENTS.consents.filter(({ kind }) => kind !== 'marketing'),
          {
            kind: 'marketing',
            version: '1',
            isGranted: true,
            grantedAt: '2026-10-07T10:00:00.000Z',
          },
        ],
      },
    });
    renderScreen(<PrivacySettingsScreen />);

    fireEvent(
      await screen.findByRole('switch', { name: 'Promociones y novedades' }),
      'valueChange',
      true,
    );

    await waitFor(() => {
      expect(findApiCall('PUT', '/v1/me/consents')?.body).toEqual({
        kind: 'marketing',
        isGranted: true,
      });
    });
  });

  it('sends a request to the center with a message', async () => {
    mockPrivacyApi({ [`POST ${BASE}/privacy-requests`]: buildRequest({ kind: 'erasure' }) });
    renderScreen(<PrivacySettingsScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Pedir: Supresión de datos' }));
    fireEvent.changeText(
      screen.getByLabelText('Cuéntale al centro qué necesitas (opcional)'),
      'Quiero que borréis mis datos.',
    );
    fireEvent.press(screen.getByRole('button', { name: 'Enviar solicitud' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/privacy-requests`)?.body).toEqual({
        kind: 'erasure',
        message: 'Quiero que borréis mis datos.',
      });
    });
  });

  it('shows the state and the deadline of what was asked, and blocks asking the same twice', async () => {
    mockPrivacyApi({}, [
      buildRequest(),
      buildRequest({
        id: 'request-2',
        kind: 'rectification',
        status: 'rejected',
        resolvedAt: '2026-10-02T10:00:00.000Z',
        resolutionNote: 'No hay nada que corregir.',
      }),
    ]);
    renderScreen(<PrivacySettingsScreen />);

    expect(await screen.findByText('El centro responde antes del 25/10/2026')).toBeOnTheScreen();
    expect(screen.getByText('Abierta')).toBeOnTheScreen();
    expect(screen.getByText('Rechazada')).toBeOnTheScreen();
    expect(screen.getByText('Respuesta del centro: No hay nada que corregir.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Pedir: Acceso a los datos' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Pedir: Rectificación de datos' }),
    ).not.toBeDisabled();
  });

  it('says there is nothing asked yet', async () => {
    mockPrivacyApi();
    renderScreen(<PrivacySettingsScreen />);

    expect(await screen.findByText('Todavía no has enviado ninguna solicitud.')).toBeOnTheScreen();
  });

  it('asks for the password and shares the data', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    mockPrivacyApi({
      'POST /v1/me/data-export': { exportedAt: '2026-10-07T10:00:00.000Z', memberships: [] },
    });
    renderScreen(<PrivacySettingsScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Descargar mis datos' }));
    expect(screen.getByRole('button', { name: 'Descargar' })).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Contraseña'), TYPED_SECRET);
    fireEvent.press(screen.getByRole('button', { name: 'Descargar' }));

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalled();
    });
    expect(findApiCall('POST', '/v1/me/data-export')?.body).toEqual({ ['password']: TYPED_SECRET });
    shareSpy.mockRestore();
  });

  it('says the password is wrong when exporting', async () => {
    mockPrivacyApi({
      'POST /v1/me/data-export': () => {
        throw buildApiError('REAUTHENTICATION_FAILED', 403);
      },
    });
    renderScreen(<PrivacySettingsScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Descargar mis datos' }));
    fireEvent.changeText(screen.getByLabelText('Contraseña'), 'mala');
    fireEvent.press(screen.getByRole('button', { name: 'Descargar' }));

    expect(await screen.findByText('La contraseña no es correcta')).toBeOnTheScreen();
  });
});

describe('DeleteAccountScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('only allows deleting with the password and the word written', () => {
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS });
    renderScreen(<DeleteAccountScreen />);
    const confirm = screen.getByRole('button', { name: 'Eliminar mi cuenta para siempre' });

    expect(confirm).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Contraseña'), TYPED_SECRET);
    expect(confirm).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'eliminar');
    expect(confirm).not.toBeDisabled();
  });

  it('deletes the account and closes the session on this phone', async () => {
    const signOut = jest.fn();
    jest.mocked(useSignOutFlow).mockReturnValue({ signOut, isSigningOut: false, isSignedIn: true });
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS, 'DELETE /v1/me': null });
    renderScreen(<DeleteAccountScreen />);

    fireEvent.changeText(screen.getByLabelText('Contraseña'), TYPED_SECRET);
    fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR');
    fireEvent.press(screen.getByRole('button', { name: 'Eliminar mi cuenta para siempre' }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
    expect(findApiCall('DELETE', '/v1/me')?.body).toEqual({
      ['password']: TYPED_SECRET,
      confirmation: 'ELIMINAR',
    });
  });

  it('tells the owner that deleting the account closes the center, and asks to confirm it', async () => {
    mockApi({ 'GET /v1/me/memberships': OWNER_MEMBERSHIPS });
    renderScreen(<DeleteAccountScreen />);

    expect(await screen.findByText('Se cerrará tu centro')).toBeOnTheScreen();
    expect(screen.getByText(/Eres propietario de Gimnasio Norte/)).toBeOnTheScreen();
    expect(screen.getByText(/se cancela su suscripción/)).toBeOnTheScreen();
  });

  it('does not let the owner delete until they confirm the center will be closed', async () => {
    mockApi({ 'GET /v1/me/memberships': OWNER_MEMBERSHIPS });
    renderScreen(<DeleteAccountScreen />);
    await screen.findByText('Se cerrará tu centro');
    const confirm = screen.getByRole('button', { name: 'Eliminar mi cuenta para siempre' });

    fireEvent.changeText(screen.getByLabelText('Contraseña'), TYPED_SECRET);
    fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR');
    expect(confirm).toBeDisabled();

    fireEvent.press(
      screen.getByRole('checkbox', { name: 'Entiendo que se cerrará y que no se puede deshacer' }),
    );
    expect(confirm).not.toBeDisabled();
  });

  it('asks the API to close the owned center together with the account', async () => {
    const signOut = jest.fn();
    jest.mocked(useSignOutFlow).mockReturnValue({ signOut, isSigningOut: false, isSignedIn: true });
    mockApi({ 'GET /v1/me/memberships': OWNER_MEMBERSHIPS, 'DELETE /v1/me': null });
    renderScreen(<DeleteAccountScreen />);
    await screen.findByText('Se cerrará tu centro');

    fireEvent.changeText(screen.getByLabelText('Contraseña'), TYPED_SECRET);
    fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR');
    fireEvent.press(
      screen.getByRole('checkbox', { name: 'Entiendo que se cerrará y que no se puede deshacer' }),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Eliminar mi cuenta para siempre' }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
    expect(findApiCall('DELETE', '/v1/me')?.body).toEqual({
      ['password']: TYPED_SECRET,
      confirmation: 'ELIMINAR',
      closeOwnedCenters: true,
    });
  });

  it('does not show the closing notice to someone who owns no center', async () => {
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS });
    renderScreen(<DeleteAccountScreen />);

    await waitFor(() => {
      expect(findApiCall('GET', '/v1/me/memberships')).toBeDefined();
    });
    expect(screen.queryByText('Se cerrará tu centro')).toBeNull();
  });

  it('explains that deleting the account closes the center if the API still asks for it', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS,
      'DELETE /v1/me': () => {
        throw buildApiError('ACCOUNT_OWNS_CENTER', 409);
      },
    });
    renderScreen(<DeleteAccountScreen />);

    fireEvent.changeText(screen.getByLabelText('Contraseña'), TYPED_SECRET);
    fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR para confirmar'), 'ELIMINAR');
    fireEvent.press(screen.getByRole('button', { name: 'Eliminar mi cuenta para siempre' }));

    expect(await screen.findByText(/al eliminar tu cuenta se cerrará/)).toBeOnTheScreen();
  });
});
