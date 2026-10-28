import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';
import { buildNotContractedVoiceOverview, buildVoiceOverview } from '@/test/voice-factories';

import { VoiceReceptionistScreen } from './VoiceReceptionistScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const BASE = `/v1/centers/${NORTE_CENTER_ID}/voice-receptionist`;
const NO_CALLS = { data: [], nextCursor: null };

function buildCall(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: '0198f4a0-0000-7000-8000-000000000001',
    callerPhone: '+34 6** *** 233',
    callerName: 'Ana Pérez',
    startedAt: '2026-10-28T10:00:00.000Z',
    durationSeconds: 125,
    outcome: 'booking',
    summary: 'Reservó una clase de yoga',
    estimatedCostCents: 12,
    hasTranscript: false,
    ...overrides,
  };
}

describe('VoiceReceptionistScreen', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('only explains the service when the center does not have it, with no price or way to buy', async () => {
    mockApi({ [`GET ${BASE}`]: buildNotContractedVoiceOverview() });
    renderScreen(<VoiceReceptionistScreen />);

    expect(await screen.findByText('Este servicio no está activo en tu centro')).toBeOnTheScreen();
    expect(screen.queryByRole('switch')).toBeNull();
    expect(
      screen.queryByRole('button', { name: /contrat|plan|precio|compr|contacta/i }),
    ).toBeNull();
    expect(screen.queryByText(/€|precio|contratar|plan/i)).toBeNull();
  });

  it('shows a loading state and then the status, the number and the usage of the period', async () => {
    mockApi({ [`GET ${BASE}`]: buildVoiceOverview(), [`GET ${BASE}/calls`]: NO_CALLS });
    renderScreen(<VoiceReceptionistScreen />);

    expect(await screen.findByText('Activo')).toBeOnTheScreen();
    expect(screen.getByText('+34910000000')).toBeOnTheScreen();
    expect(screen.getByText('100 de 400 minutos')).toBeOnTheScreen();
    expect(screen.getByText('Todo en orden')).toBeOnTheScreen();
    expect(screen.queryByText(/€/)).toBeNull();
  });

  it('says in words that the included minutes are nearly or fully used, and what happens next', async () => {
    mockApi({
      [`GET ${BASE}`]: buildVoiceOverview({
        usage: {
          includedMinutes: 150,
          usedMinutes: 170,
          remainingMinutes: 0,
          overageMinutes: 20,
          usedPercent: 113,
        },
        config: {
          ...buildVoiceOverview().config,
          overagePolicy: 'disable_bot',
        } as never,
      }),
      [`GET ${BASE}/calls`]: NO_CALLS,
    });
    renderScreen(<VoiceReceptionistScreen />);

    expect(await screen.findByText('Minutos incluidos agotados')).toBeOnTheScreen();
    expect(screen.getByText('Has pasado de lo incluido en 20 min.')).toBeOnTheScreen();
    expect(screen.getByText(/deja de atender y tu línea suena como siempre/)).toBeOnTheScreen();
  });

  it('shows the paused state without a switch to turn it on', async () => {
    const overview = buildVoiceOverview();
    mockApi({
      [`GET ${BASE}`]: {
        ...overview,
        isEnabled: false,
        subscription: { ...overview.subscription, status: 'paused' },
      },
      [`GET ${BASE}/calls`]: NO_CALLS,
    });
    renderScreen(<VoiceReceptionistScreen />);

    expect(await screen.findByText('En pausa')).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Contestador activado' })).toBeNull();
  });

  it('turns the service off and reloads the status', async () => {
    mockApi({
      [`GET ${BASE}`]: buildVoiceOverview(),
      [`GET ${BASE}/calls`]: NO_CALLS,
      [`POST ${BASE}/disable`]: undefined,
    });
    renderScreen(<VoiceReceptionistScreen />);

    fireEvent(
      await screen.findByRole('switch', { name: 'Contestador activado' }),
      'valueChange',
      false,
    );

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/disable`)).toBeDefined();
    });
  });

  it('says why the service could not be turned on', async () => {
    mockApi({
      [`GET ${BASE}`]: buildVoiceOverview({ isEnabled: false }),
      [`GET ${BASE}/calls`]: NO_CALLS,
      [`POST ${BASE}/enable`]: () => {
        throw buildApiError('VOICE_LINE_NOT_ASSIGNED', 409);
      },
    });
    renderScreen(<VoiceReceptionistScreen />);

    fireEvent(
      await screen.findByRole('switch', { name: 'Contestador activado' }),
      'valueChange',
      true,
    );

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
  });

  it('shows how to forward the calls and calls the bridge number for the test', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockApi({ [`GET ${BASE}`]: buildVoiceOverview(), [`GET ${BASE}/calls`]: NO_CALLS });
    renderScreen(<VoiceReceptionistScreen />);

    expect(await screen.findByText('Cómo desviar las llamadas')).toBeOnTheScreen();
    expect(screen.getAllByText(/Si no contestas/).length).toBeGreaterThan(0);
    fireEvent.press(screen.getByRole('button', { name: /Llamar al número puente/ }));

    expect(openUrl).toHaveBeenCalledWith('tel:+34910000000');
    openUrl.mockRestore();
  });

  it('saves the settings, sending the greeting only when the center can customize it', async () => {
    mockApi({
      [`GET ${BASE}`]: buildVoiceOverview(),
      [`GET ${BASE}/calls`]: NO_CALLS,
      [`PUT ${BASE}/config`]: buildVoiceOverview().config,
    });
    renderScreen(<VoiceReceptionistScreen />);

    fireEvent.changeText(await screen.findByLabelText('Saludo'), 'Buenas, Yoga Norte');
    fireEvent.changeText(
      screen.getByLabelText('Teléfono para pasar la llamada a una persona'),
      '+34 600 11 22 33',
    );
    fireEvent.press(screen.getByRole('radio', { name: /Dejar de atender/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PUT', `${BASE}/config`)?.body).toMatchObject({
        greeting: 'Buenas, Yoga Norte',
        humanTransferPhone: '+34600112233',
        overagePolicy: 'disable_bot',
      });
    });
    expect(await screen.findByText('Cambios guardados.')).toBeOnTheScreen();
  });

  it('keeps the greeting read-only, without an offer to change it, when the plan does not allow it', async () => {
    mockApi({
      [`GET ${BASE}`]: buildVoiceOverview({
        capabilities: { ...buildVoiceOverview().capabilities, canCustomizeAssistant: false },
      }),
      [`GET ${BASE}/calls`]: NO_CALLS,
      [`PUT ${BASE}/config`]: buildVoiceOverview().config,
    });
    renderScreen(<VoiceReceptionistScreen />);

    expect(
      await screen.findByText(
        'El saludo y el nombre del asistente no se pueden cambiar en tu centro.',
      ),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PUT', `${BASE}/config`)).toBeDefined();
    });
    expect(findApiCall('PUT', `${BASE}/config`)?.body).not.toHaveProperty('greeting');
  });

  it('shows an invalid transfer phone as an error and does not save', async () => {
    mockApi({ [`GET ${BASE}`]: buildVoiceOverview(), [`GET ${BASE}/calls`]: NO_CALLS });
    renderScreen(<VoiceReceptionistScreen />);

    fireEvent.changeText(
      await screen.findByLabelText('Teléfono para pasar la llamada a una persona'),
      '600112233',
    );
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByText('Escríbelo con prefijo y solo números, por ejemplo +34600112233.'),
    ).toBeOnTheScreen();
    expect(findApiCall('PUT', `${BASE}/config`)).toBeUndefined();
  });

  it('lists the calls with their outcome, and says so when there are none', async () => {
    mockApi({
      [`GET ${BASE}`]: buildVoiceOverview(),
      [`GET ${BASE}/calls`]: { data: [buildCall()], nextCursor: null },
    });
    renderScreen(<VoiceReceptionistScreen />);

    expect(await screen.findByText('Ana Pérez')).toBeOnTheScreen();
    expect(screen.getByText('Cita reservada')).toBeOnTheScreen();
    expect(screen.getByText('Reservó una clase de yoga')).toBeOnTheScreen();
  });

  it('says there are no calls yet', async () => {
    mockApi({ [`GET ${BASE}`]: buildVoiceOverview(), [`GET ${BASE}/calls`]: NO_CALLS });
    renderScreen(<VoiceReceptionistScreen />);

    expect(await screen.findByText('Aún no hay llamadas')).toBeOnTheScreen();
  });

  it('loads more calls with the cursor', async () => {
    mockApi({
      [`GET ${BASE}`]: buildVoiceOverview(),
      [`GET ${BASE}/calls`]: ({ path }: { path: string }) =>
        path.includes('cursor=next-1')
          ? { data: [buildCall({ id: '2', callerName: 'Luis Gil' })], nextCursor: null }
          : { data: [buildCall()], nextCursor: 'next-1' },
    });
    renderScreen(<VoiceReceptionistScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Ver más llamadas' }));

    expect(await screen.findByText('Luis Gil')).toBeOnTheScreen();
    expect(screen.getByText('Ana Pérez')).toBeOnTheScreen();
  });

  it('offers to retry when the status cannot be loaded', async () => {
    mockApi({});
    renderScreen(<VoiceReceptionistScreen />);

    expect(await screen.findByText('No hemos podido cargar el Contestador IA')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});
