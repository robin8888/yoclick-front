import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { apiMutator } from '@/shared/api/api-mutator';
import { buildApiError, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { NORTE_CENTER_ID } from '@/test/factories';
import { renderScreen } from '@/test/render-screen';

import { usePendingCenterStore } from '../model/pending-center-store';
import { JoinCodeScreen } from './JoinCodeScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const NORTE_PUBLIC_CENTER = {
  id: NORTE_CENTER_ID,
  name: 'Studio Norte',
  slug: 'studio-norte',
  sectorId: 'estudio',
  brandColor: '#E4572E',
  city: [],
};

function submitJoinCode(joinCode: string): void {
  fireEvent.changeText(screen.getByLabelText('Código del centro'), joinCode);
  fireEvent.press(screen.getByRole('button', { name: 'Buscar mi centro' }));
}

describe('JoinCodeScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    usePendingCenterStore.getState().clearPendingCenter();
  });

  it('finds the center by code, keeps it as the chosen center and goes to confirm it', async () => {
    mockApi({ 'GET /v1/join/code/NORTE7': NORTE_PUBLIC_CENTER });
    renderScreen(<JoinCodeScreen />);

    submitJoinCode('norte7');

    await waitFor(() => {
      expect(getMockRouter().push).toHaveBeenCalledWith(`/join/${NORTE_CENTER_ID}`);
    });
    expect(usePendingCenterStore.getState().pendingCenter).toMatchObject({
      id: NORTE_CENTER_ID,
      name: 'Studio Norte',
      joinCode: 'NORTE7',
    });
  });

  it('explains what to do when the code does not exist', async () => {
    mockApi({
      'GET /v1/join/code/GYM000': () => {
        throw buildApiError('JOIN_CODE_INVALID', 404);
      },
    });
    renderScreen(<JoinCodeScreen />);

    submitJoinCode('GYM000');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No encontramos ningún centro con ese código. Revísalo o pídelo en recepción.',
    );
    expect(getMockRouter().push).not.toHaveBeenCalled();
  });

  it('rejects a malformed code without calling the API', async () => {
    mockApi({});
    renderScreen(<JoinCodeScreen />);

    submitJoinCode('NO-VALE');

    expect(
      await screen.findByText('El código tiene entre 4 y 16 letras o números'),
    ).toBeOnTheScreen();
    expect(jest.mocked(apiMutator)).not.toHaveBeenCalled();
  });

  it('shows the connection error message when the network fails', async () => {
    mockApi({
      'GET /v1/join/code/NORTE7': () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<JoinCodeScreen />);

    submitJoinCode('NORTE7');

    expect(await screen.findByRole('alert')).toHaveTextContent(/Algo ha fallado de nuestro lado/);
  });
});
