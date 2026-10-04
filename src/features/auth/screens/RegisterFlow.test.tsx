/* eslint-disable sonarjs/no-hardcoded-passwords -- contraseñas de prueba, no credenciales reales */
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { useAuthFlowStore } from '../model/auth-flow-store';
import { RegisterAccountScreen } from './RegisterAccountScreen';
import { RegisterGoalsScreen } from './RegisterGoalsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const COMPLETE_DRAFT = {
  fullName: 'Marta Ruiz',
  email: 'marta@correo.es',
  password: 'una-clave-larga-1',
  hasMarketingConsent: false,
  experience: null,
  goalIds: [],
} as const;

function fillAccount(): void {
  fireEvent.changeText(screen.getByLabelText('Nombre y apellidos'), 'Marta Ruiz');
  fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'marta@correo.es');
  fireEvent.changeText(screen.getByLabelText('Contraseña'), 'una-clave-larga-1');
}

describe('RegisterAccountScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useAuthFlowStore.setState({ registrationDraft: null });
    });
  });

  it('starts with every consent unchecked and separate', () => {
    renderScreen(<RegisterAccountScreen />);

    expect(
      screen.getByRole('checkbox', { name: 'Acepto la política de privacidad.', checked: false }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('checkbox', {
        name: 'Acepto las condiciones del servicio.',
        checked: false,
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('checkbox', {
        name: 'Quiero recibir novedades y ofertas del centro (opcional).',
        checked: false,
      }),
    ).toBeOnTheScreen();
  });

  it('requires the privacy and terms consents before continuing', async () => {
    renderScreen(<RegisterAccountScreen />);
    fillAccount();

    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByText('Tienes que aceptar la política de privacidad'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Tienes que aceptar las condiciones del servicio')).toBeOnTheScreen();
    expect(getMockRouter().push).not.toHaveBeenCalled();
  });

  it('requires a password of at least 10 characters', async () => {
    renderScreen(<RegisterAccountScreen />);
    fillAccount();
    fireEvent.changeText(screen.getByLabelText('Contraseña'), 'corta');

    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Usa al menos 10 caracteres')).toBeOnTheScreen();
  });

  it('keeps the draft in memory and moves to the second step', async () => {
    renderScreen(<RegisterAccountScreen />);
    fillAccount();
    fireEvent.press(screen.getByRole('checkbox', { name: 'Acepto la política de privacidad.' }));
    fireEvent.press(screen.getByRole('checkbox', { name: 'Acepto las condiciones del servicio.' }));

    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(getMockRouter().push).toHaveBeenCalledWith('/(auth)/register/goals');
    });
    expect(useAuthFlowStore.getState().registrationDraft).toMatchObject({
      fullName: 'Marta Ruiz',
      email: 'marta@correo.es',
      hasMarketingConsent: false,
    });
  });
});

describe('RegisterGoalsScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useAuthFlowStore.setState({ registrationDraft: COMPLETE_DRAFT, pendingEmail: null });
    });
  });

  it('goes back to the first step when there is no draft', () => {
    act(() => {
      useAuthFlowStore.setState({ registrationDraft: null });
    });
    renderScreen(<RegisterGoalsScreen />);

    expect(screen.getByText('redirect:/(auth)/register')).toBeOnTheScreen();
  });

  it('requires choosing the experience', async () => {
    mockApi({});
    renderScreen(<RegisterGoalsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Elige una opción')).toBeOnTheScreen();
    expect(findApiCall('POST', '/v1/auth/register')).toBeUndefined();
  });

  it('shows the starting level with the sector vocabulary', () => {
    renderScreen(<RegisterGoalsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Más de 2 años' }));

    expect(
      screen.getByText('Empezarás en nivel Avanzado. Tu profesional puede ajustarlo.'),
    ).toBeOnTheScreen();
  });

  it('registers with the separate consents, clears the password and asks for the email code', async () => {
    mockApi({ 'POST /v1/auth/register': { status: 'verification_sent' } });
    renderScreen(<RegisterGoalsScreen />);
    fireEvent.press(screen.getByRole('button', { name: '1–2 años' }));

    fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/(auth)/verify-email');
    });
    expect(findApiCall('POST', '/v1/auth/register')?.body).toEqual({
      email: 'marta@correo.es',
      password: 'una-clave-larga-1',
      fullName: 'Marta Ruiz',
      consents: { privacy: true, terms: true, marketing: false },
    });
    expect(useAuthFlowStore.getState().registrationDraft).toBeNull();
    expect(useAuthFlowStore.getState().pendingEmail).toBe('marta@correo.es');
  });

  it('shows the API error and keeps the draft so the person can retry', async () => {
    mockApi({
      'POST /v1/auth/register': () => {
        throw buildApiError('PASSWORD_BREACHED', 422);
      },
    });
    renderScreen(<RegisterGoalsScreen />);
    fireEvent.press(screen.getByRole('button', { name: '1–2 años' }));

    fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esa contraseña aparece en filtraciones públicas. Elige otra',
    );
    expect(useAuthFlowStore.getState().registrationDraft).not.toBeNull();
  });
});
