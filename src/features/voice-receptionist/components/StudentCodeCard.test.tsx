import * as Clipboard from 'expo-clipboard';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { StudentCodeCard } from './StudentCodeCard';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn().mockResolvedValue(true) }));

const CODE_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/me/student-code`;

describe('StudentCodeCard', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('shows the code with its explanation and copies it', async () => {
    mockApi({ [CODE_PATH]: { code: '482913' } });
    renderScreen(<StudentCodeCard />);

    expect(await screen.findByText('482913')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Es tu código en este centro. Díctalo cuando llames para que te identifiquen.',
      ),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Copiar código' }));

    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('482913');
    });
    expect(await screen.findByRole('button', { name: 'Código copiado' })).toBeOnTheScreen();
  });

  it('warns without blocking when the code cannot be loaded, and lets the person retry', async () => {
    mockApi({});
    renderScreen(<StudentCodeCard />);

    expect(await screen.findByText('No hemos podido cargar tu código.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});
