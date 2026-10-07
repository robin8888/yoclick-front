import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';

import { useSessionStore } from '@/shared/auth/session-store';
import { uploadWithTus } from '@/shared/lib/tus-upload/upload-with-tus';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { MyPublicProfileScreen } from './MyPublicProfileScreen';
import { TeamProfilesAdminScreen } from './TeamProfilesAdminScreen';
import { TeamVideosScreen } from './TeamVideosScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('@/shared/lib/tus-upload/upload-with-tus', () => ({
  uploadWithTus: jest.fn(() => Promise.resolve()),
  TusUploadError: class TusUploadError extends Error {},
}));
jest.mock('expo-file-system', () => ({
  FileMode: { ReadOnly: 'r' },
  File: jest.fn(() => ({
    open: () => ({
      offset: 0,
      readBytes: (length: number) => new Uint8Array(length),
      close: jest.fn(),
    }),
  })),
}));

const BASE = `/v1/centers/${NORTE_CENTER_ID}`;
const MEMBERSHIPS = (role: string) => ({
  memberships: [
    { membershipId: 'm1', centerId: NORTE_CENTER_ID, role, center: { sectorId: 'gym' } },
  ],
});
const PLAN_WITH_VIDEO = { isIncluded: true, limitBytes: 5_368_709_120, usedBytes: 52_428_800 };
const PLAN_WITHOUT_VIDEO = { isIncluded: false, limitBytes: null, usedBytes: 0 };

function buildVideo(overrides: Record<string, unknown> = {}) {
  return {
    id: 'video-1',
    title: 'Presentación',
    status: 'ready',
    reviewStatus: 'approved',
    reviewNote: null,
    durationSeconds: 42,
    playback: {
      streamUrl: 'https://video.example/video-1/playlist.m3u8',
      thumbnailUrl: 'https://video.example/video-1/thumbnail.jpg',
      expiresAt: '2026-10-07T14:00:00.000Z',
    },
    ...overrides,
  };
}

function buildMember(overrides: Record<string, unknown> = {}) {
  return {
    membershipId: 'staff-1',
    isMe: false,
    fullName: 'Marta Gil',
    staffTitle: 'Entrenadora',
    video: null,
    ...overrides,
  };
}

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('MyPublicProfileScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('explains that the plan does not include video', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/video-plan`]: PLAN_WITHOUT_VIDEO,
      [`GET ${BASE}/team-profiles`]: { members: [buildMember({ isMe: true })] },
    });
    renderScreen(<MyPublicProfileScreen />);

    expect(await screen.findByText('Tu plan no incluye vídeo')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Añadir vídeo' })).toBeNull();
  });

  it('offers to add the presentation video and shows how much space is used', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/video-plan`]: PLAN_WITH_VIDEO,
      [`GET ${BASE}/team-profiles`]: { members: [buildMember({ isMe: true })] },
    });
    renderScreen(<MyPublicProfileScreen />);

    expect(await screen.findByRole('button', { name: 'Añadir vídeo' })).toBeOnTheScreen();
    expect(screen.getByText('Espacio de vídeo: 50 MB de 5 GB')).toBeOnTheScreen();
  });

  it.each([
    {
      caseName: 'waiting for the review',
      video: buildVideo({ reviewStatus: 'pending' }),
      text: 'Pendiente de revisión: el centro lo verá antes de publicarlo.',
    },
    {
      caseName: 'published',
      video: buildVideo(),
      text: 'Publicado: ya lo ven en el centro.',
    },
    {
      caseName: 'with changes requested',
      video: buildVideo({ reviewStatus: 'changes_requested', reviewNote: 'Hay poca luz.' }),
      text: 'El centro te pide cambios: Hay poca luz.',
    },
  ])('tells the person their video is $caseName', async ({ video, text }) => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/video-plan`]: PLAN_WITH_VIDEO,
      [`GET ${BASE}/team-profiles`]: { members: [buildMember({ isMe: true, video })] },
    });
    renderScreen(<MyPublicProfileScreen />);

    expect(await screen.findByText(text)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cambiar vídeo' })).toBeOnTheScreen();
  });

  it('picks a video, uploads it directly to the video service and waits until it is ready', async () => {
    jest.mocked(launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///videos/presentacion.mov',
          fileName: 'presentacion.mov',
          fileSize: 50_000_000,
          mimeType: 'video/quicktime',
          width: 1920,
          height: 1080,
        },
      ],
    });
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/video-plan`]: PLAN_WITH_VIDEO,
      [`GET ${BASE}/team-profiles`]: { members: [buildMember({ isMe: true })] },
      [`POST ${BASE}/videos`]: {
        video: buildVideo({ status: 'uploading', reviewStatus: 'pending', playback: null }),
        upload: {
          endpoint: 'https://video.example/tusupload',
          headers: { VideoId: 'video-1', AuthorizationSignature: 'signature' },
          expiresAt: '2026-10-07T16:00:00.000Z',
        },
      },
      [`GET ${BASE}/videos/video-1`]: buildVideo({ reviewStatus: 'pending' }),
    });
    renderScreen(<MyPublicProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Añadir vídeo' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/videos`)?.body).toEqual({
        title: 'presentacion',
        sizeBytes: 50_000_000,
        purpose: 'profile',
      });
    });
    await waitFor(() => {
      expect(findApiCall('GET', `${BASE}/videos/video-1`)).toBeDefined();
    });
    expect(uploadWithTus).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'https://video.example/tusupload',
        headers: { VideoId: 'video-1', AuthorizationSignature: 'signature' },
        metadata: { filetype: 'video/quicktime', title: 'presentacion' },
        totalBytes: 50_000_000,
      }),
    );
  });

  it('refuses a video that is too big before reserving anything', async () => {
    jest.mocked(launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///videos/larga.mp4',
          fileName: 'larga.mp4',
          fileSize: 600 * 1_048_576,
          mimeType: 'video/mp4',
          width: 1920,
          height: 1080,
        },
      ],
    });
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/video-plan`]: PLAN_WITH_VIDEO,
      [`GET ${BASE}/team-profiles`]: { members: [buildMember({ isMe: true })] },
    });
    renderScreen(<MyPublicProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Añadir vídeo' }));

    expect(
      await screen.findByText('El vídeo pesa más de 500 MB. Elige uno más corto o comprímelo.'),
    ).toBeOnTheScreen();
    expect(findApiCall('POST', `${BASE}/videos`)).toBeUndefined();
  });

  it('does nothing when the person closes the gallery without choosing', async () => {
    jest.mocked(launchImageLibraryAsync).mockResolvedValue({ canceled: true, assets: null });
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/video-plan`]: PLAN_WITH_VIDEO,
      [`GET ${BASE}/team-profiles`]: { members: [buildMember({ isMe: true })] },
    });
    renderScreen(<MyPublicProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Añadir vídeo' }));

    await waitFor(() => {
      expect(launchImageLibraryAsync).toHaveBeenCalled();
    });
    expect(findApiCall('POST', `${BASE}/videos`)).toBeUndefined();
  });

  it('says the plan has no video when the server refuses the upload', async () => {
    jest.mocked(launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///videos/a.mp4',
          fileName: 'a.mp4',
          fileSize: 1000,
          mimeType: 'video/mp4',
          width: 10,
          height: 10,
        },
      ],
    });
    const { buildApiError } =
      jest.requireActual<typeof import('@/test/mock-api')>('@/test/mock-api');
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/video-plan`]: PLAN_WITH_VIDEO,
      [`GET ${BASE}/team-profiles`]: { members: [buildMember({ isMe: true })] },
      [`POST ${BASE}/videos`]: () => {
        throw buildApiError('VIDEO_QUOTA_EXCEEDED', 409);
      },
    });
    renderScreen(<MyPublicProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Añadir vídeo' }));

    expect(
      await screen.findByText(
        'Tu centro ha llenado su espacio de vídeo. Borra alguno para poder subir otro.',
      ),
    ).toBeOnTheScreen();
  });
});

describe('TeamProfilesAdminScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  const pendingMembers = {
    members: [
      buildMember({ video: buildVideo({ reviewStatus: 'pending' }) }),
      buildMember({ membershipId: 'staff-2', fullName: 'Luis Soto', staffTitle: null }),
    ],
  };

  it('lists who is waiting for review and the whole team with the state of each video', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/team-profiles`]: pendingMembers,
    });
    renderScreen(<TeamProfilesAdminScreen />);

    expect(await screen.findByRole('button', { name: 'Aprobar y publicar' })).toBeOnTheScreen();
    expect(screen.getByText('Luis Soto')).toBeOnTheScreen();
    expect(screen.getByText('Sin vídeo')).toBeOnTheScreen();
    expect(screen.getAllByText('Pendiente de revisión').length).toBeGreaterThan(0);
  });

  it('says there is nothing to review', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/team-profiles`]: { members: [buildMember()] },
    });
    renderScreen(<TeamProfilesAdminScreen />);

    expect(
      await screen.findByText(
        'No hay nada pendiente de revisar. Cuando alguien del equipo suba un vídeo, aparecerá aquí.',
      ),
    ).toBeOnTheScreen();
  });

  it('opens the own presentation video of the administration', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/team-profiles`]: pendingMembers,
    });
    renderScreen(<TeamProfilesAdminScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Mi vídeo de presentación' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/public-profile');
  });

  it('approves a video', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/team-profiles`]: pendingMembers,
      [`POST ${BASE}/videos/video-1/review`]: buildVideo(),
    });
    renderScreen(<TeamProfilesAdminScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Aprobar y publicar' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/videos/video-1/review`)?.body).toEqual({
        decision: 'approve',
      });
    });
  });

  it('asks for changes with a note, and cannot send it empty', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/team-profiles`]: pendingMembers,
      [`POST ${BASE}/videos/video-1/review`]: buildVideo({ reviewStatus: 'changes_requested' }),
    });
    renderScreen(<TeamProfilesAdminScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Pedir cambios' }));

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Qué debe cambiar'), 'Hay poca luz.');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/videos/video-1/review`)?.body).toEqual({
        decision: 'request_changes',
        note: 'Hay poca luz.',
      });
    });
  });
});

describe('TeamVideosScreen (client)', () => {
  beforeEach(() => {
    signIn();
  });

  it('shows the team members that have a published video, and plays it', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/team-profiles`]: {
        members: [buildMember({ video: buildVideo({ title: 'Hola, soy Marta' }) })],
      },
    });
    renderScreen(<TeamVideosScreen />);

    expect(await screen.findByText('Marta Gil')).toBeOnTheScreen();
    expect(screen.getByText('Entrenadora')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Reproducir Hola, soy Marta' }));
    expect(screen.getByLabelText('Vídeo: Hola, soy Marta')).toBeOnTheScreen();
  });

  it('explains that there are no videos yet', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/team-profiles`]: { members: [] },
    });
    renderScreen(<TeamVideosScreen />);

    expect(await screen.findByText('Todavía no hay vídeos del equipo')).toBeOnTheScreen();
  });
});
