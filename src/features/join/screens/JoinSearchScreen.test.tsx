import { fireEvent, screen } from '@testing-library/react-native';

import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { NORTE_CENTER_ID } from '@/test/factories';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { usePendingCenterStore } from '../model/pending-center-store';
import { JoinSearchScreen } from './JoinSearchScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const NORTE_RESULT = {
  id: NORTE_CENTER_ID,
  name: 'Studio Norte',
  slug: 'studio-norte',
  sectorId: 'estudio',
  brandColor: '#E4572E',
  city: 'Madrid',
  distanceInKilometers: 1.2,
};

function searchFor(searchQuery: string): void {
  fireEvent.changeText(screen.getByLabelText('Nombre o ciudad'), searchQuery);
  fireEvent(screen.getByLabelText('Nombre o ciudad'), 'submitEditing');
}

describe('JoinSearchScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    usePendingCenterStore.getState().clearPendingCenter();
  });

  it('asks for a name or a city before searching anything', () => {
    mockApi({});
    renderScreen(<JoinSearchScreen />);

    expect(screen.getByText('Escribe el nombre del centro o su ciudad.')).toBeOnTheScreen();
  });

  it('lists the centers found with city and distance, and chooses one', async () => {
    mockApi({ 'GET /v1/join/search': { centers: [NORTE_RESULT] } });
    renderScreen(<JoinSearchScreen />);

    searchFor('norte');
    fireEvent.press(await screen.findByRole('button', { name: 'Studio Norte. Madrid · 1,2 km' }));

    expect(findApiCall('GET', '/v1/join/search?q=norte')).toBeDefined();
    expect(getMockRouter().push).toHaveBeenCalledWith(`/join/${NORTE_CENTER_ID}`);
    expect(usePendingCenterStore.getState().pendingCenter?.id).toBe(NORTE_CENTER_ID);
  });

  it('offers the join code when nothing matches', async () => {
    mockApi({ 'GET /v1/join/search': { centers: [] } });
    renderScreen(<JoinSearchScreen />);

    searchFor('zzz');

    expect(await screen.findByRole('heading', { name: 'Sin resultados' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Tengo un código' }));
    expect(getMockRouter().push).toHaveBeenCalledWith('/join/code');
  });

  it('shows an error with a retry that searches again', async () => {
    let shouldFail = true;
    mockApi({
      'GET /v1/join/search': () => {
        if (shouldFail) throw buildApiError('INTERNAL_ERROR', 500);
        return { centers: [NORTE_RESULT] };
      },
    });
    renderScreen(<JoinSearchScreen />);

    searchFor('norte');
    expect(
      await screen.findByRole('heading', { name: 'No hemos podido buscar centros' }),
    ).toBeOnTheScreen();
    shouldFail = false;
    fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('button', { name: /Studio Norte/ })).toBeOnTheScreen();
  });

  it('does not search with a single letter', async () => {
    mockApi({});
    renderScreen(<JoinSearchScreen />);

    searchFor('n');

    expect(await screen.findByText('Escribe al menos 2 letras')).toBeOnTheScreen();
    expect(findApiCall('GET', '/v1/join/search')).toBeUndefined();
  });
});
