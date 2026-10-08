import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { usePendingInvitationStore } from '@/features/join';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { useAuthFlowStore } from '../model/auth-flow-store';
import { InviteCodeScreen } from './InviteCodeScreen';
import { LoginScreen } from './LoginScreen';
import { RegisterAccountScreen } from './RegisterAccountScreen';
import { StartScreen } from './StartScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_ID = '0b0cbd0e-7f87-4c43-a5ec-9f5a0b6b5c11';
const CODE = 'ABCD-EFGH-JKLM';
const PREVIEW_PATH = `GET /v1/join/invitations/${CODE}`;
const CENTER = {
  id: CENTER_ID,
  name: 'Ninja Rojo',
  sectorId: 'marciales',
  brandColor: '#C8102E',
  logoUrl: null,
};
const STAFF_BY_PHONE = {
  role: 'staff',
  emailHint: null,
  expiresAt: '2026-10-12T10:00:00.000Z',
  center: CENTER,
};
const CLIENT_BY_EMAIL = {
  role: 'client',
  emailHint: 'm***@yopmail.com',
  expiresAt: '2026-10-12T10:00:00.000Z',
  center: CENTER,
};

function resetInvitation(): void {
  resetMockRouter();
  act(() => {
    useAuthFlowStore.setState({ registrationDraft: null, pendingEmail: null });
    usePendingInvitationStore.getState().clearInvitation();
  });
}

function carryInvitation(): void {
  act(() => {
    usePendingInvitationStore.getState().saveInvitationCode(CODE);
  });
}

function fillAccount(): void {
  fireEvent.changeText(screen.getByLabelText('Nombre y apellidos'), 'Marta Ruiz');
  fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'marta@correo.es');
  fireEvent.changeText(screen.getByLabelText('Contraseña'), 'una-clave-larga-1');
  fireEvent.press(screen.getByRole('checkbox', { name: 'Acepto la política de privacidad.' }));
  fireEvent.press(screen.getByRole('checkbox', { name: 'Acepto las condiciones del servicio.' }));
}

describe('StartScreen · código de un centro', () => {
  beforeEach(resetInvitation);

  it('offers to type a code when nobody has invited the person yet', () => {
    renderScreen(<StartScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Tengo un código de mi centro' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/code');
  });

  it('is the center’s own screen when the person arrives with an invitation', async () => {
    mockApi({ [PREVIEW_PATH]: STAFF_BY_PHONE });
    carryInvitation();
    renderScreen(<StartScreen />);

    expect(await screen.findByText('Te han invitado a Ninja Rojo')).toBeOnTheScreen();
    expect(screen.getByText(/Entrarás como maestro/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tengo un código de mi centro' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeOnTheScreen();
  });
});

describe('InviteCodeScreen', () => {
  beforeEach(resetInvitation);

  it('keeps a valid code and continues to the registration', async () => {
    mockApi({ [PREVIEW_PATH]: STAFF_BY_PHONE });
    renderScreen(<InviteCodeScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de invitación'), CODE);
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/register');
    });
    expect(usePendingInvitationStore.getState().invitationCode).toBe(CODE);
  });

  it('explains an invalid code and keeps nothing', async () => {
    mockApi({
      [PREVIEW_PATH]: () => {
        throw buildApiError('INVITATION_INVALID', 404);
      },
    });
    renderScreen(<InviteCodeScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de invitación'), CODE);
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
    expect(usePendingInvitationStore.getState().invitationCode).toBeNull();
    expect(getMockRouter().replace).not.toHaveBeenCalled();
  });
});

describe('RegisterAccountScreen · con invitación', () => {
  beforeEach(resetInvitation);

  it('does not ask who the person is: the code already says it', async () => {
    mockApi({ [PREVIEW_PATH]: STAFF_BY_PHONE });
    carryInvitation();
    renderScreen(<RegisterAccountScreen />);

    expect(
      await screen.findByText('Crea tu cuenta para entrar en Ninja Rojo como maestro.'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Soy propietario/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Soy alumno/ })).toBeNull();
  });

  it('registers an instructor right away, without the experience step', async () => {
    mockApi({
      [PREVIEW_PATH]: STAFF_BY_PHONE,
      'POST /v1/auth/register': { status: 'verification_sent' },
    });
    carryInvitation();
    renderScreen(<RegisterAccountScreen />);
    await screen.findByText(/como maestro/);
    fillAccount();

    fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/verify-email');
    });
  });

  it('sends an invited student to the experience step and reminds the email of the invitation', async () => {
    mockApi({ [PREVIEW_PATH]: CLIENT_BY_EMAIL });
    carryInvitation();
    renderScreen(<RegisterAccountScreen />);
    expect(await screen.findByText(/Usa el correo m\*\*\*@yopmail\.com/)).toBeOnTheScreen();
    fillAccount();

    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/register/goals');
    });
    expect(findApiCall('POST', '/v1/auth/register')).toBeUndefined();
  });
});

describe('LoginScreen · con invitación', () => {
  beforeEach(resetInvitation);

  it('says which center the person is entering and in which role', async () => {
    mockApi({ [PREVIEW_PATH]: CLIENT_BY_EMAIL });
    carryInvitation();
    renderScreen(<LoginScreen />);

    expect(
      await screen.findByText('Inicia sesión para entrar en Ninja Rojo como alumno.'),
    ).toBeOnTheScreen();
  });
});
