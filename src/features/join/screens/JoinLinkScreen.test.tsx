import { act, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { usePendingCenterStore } from '../model/pending-center-store';
import { JoinLinkScreen } from './JoinLinkScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const NINJA_CENTER = {
  id: NORTE_CENTER_ID,
  name: 'Academia Ninja Mortal',
  slug: 'ninja',
  sectorId: 'artes_marciales',
  brandColor: '#C8102E',
  city: [],
};

describe('JoinLinkScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      useSessionStore.getState().resetSession();
      usePendingCenterStore.getState().clearPendingCenter();
    });
  });

  it('keeps the center of the link and goes to the start with its look when signed out', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ code: 'ninja7' });
    mockApi({ 'GET /v1/join/code/NINJA7': NINJA_CENTER });
    renderScreen(<JoinLinkScreen />);

    expect(await screen.findByText('redirect:/(auth)/start')).toBeOnTheScreen();
    expect(usePendingCenterStore.getState().pendingCenter).toMatchObject({
      id: NORTE_CENTER_ID,
      name: 'Academia Ninja Mortal',
      joinCode: 'NINJA7',
      joinSource: 'link',
    });
  });

  it('asks to confirm the center when the person already has a session', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ code: 'NINJA7' });
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    });
    mockApi({ 'GET /v1/join/code/NINJA7': NINJA_CENTER });
    renderScreen(<JoinLinkScreen />);

    expect(await screen.findByText(`redirect:/join/${NORTE_CENTER_ID}`)).toBeOnTheScreen();
  });

  it('sends a link with a malformed code to the root without asking the server', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ code: '!!' });
    renderScreen(<JoinLinkScreen />);

    expect(screen.getByText('redirect:/')).toBeOnTheScreen();
  });

  it('says the link could not be opened when the center does not exist', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ code: 'NOEXISTE' });
    mockApi({
      'GET /v1/join/code/NOEXISTE': () => {
        throw buildApiError('JOIN_CODE_INVALID', 404);
      },
    });
    renderScreen(<JoinLinkScreen />);

    expect(await screen.findByText('No hemos podido abrir ese enlace')).toBeOnTheScreen();
  });
});
