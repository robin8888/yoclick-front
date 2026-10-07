import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';

import type { VideoResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { uploadWithTus } from '@/shared/lib/tus-upload/upload-with-tus';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { useVideoPlayer } from 'expo-video';

import { PlayableVideo } from './PlayableVideo';
import { VideoUploadField } from './VideoUploadField';

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

function buildVideo(overrides: Partial<VideoResponseDto> = {}): VideoResponseDto {
  return {
    id: 'video-1',
    title: 'Sentadilla',
    status: 'ready',
    reviewStatus: 'approved',
    reviewNote: null,
    durationSeconds: 372,
    playback: {
      streamUrl: 'https://video.example/video-1/playlist.m3u8',
      thumbnailUrl: 'https://video.example/video-1/thumbnail.jpg',
      expiresAt: '2026-10-07T14:00:00.000Z',
    },
    ...overrides,
  };
}

function pickAsset(overrides: Record<string, unknown> = {}): void {
  jest.mocked(launchImageLibraryAsync).mockResolvedValue({
    canceled: false,
    assets: [
      {
        uri: 'file:///videos/sentadilla.mov',
        fileName: 'sentadilla.mov',
        fileSize: 50_000_000,
        mimeType: 'video/quicktime',
        width: 1920,
        height: 1080,
        ...overrides,
      },
    ],
  });
}

describe('VideoUploadField', () => {
  const onVideoChange = jest.fn();

  beforeEach(() => {
    onVideoChange.mockReset();
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('picks a video, uploads it directly to the video service and waits until it is ready', async () => {
    pickAsset();
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`POST ${BASE}/videos`]: {
        video: buildVideo({ status: 'uploading', playback: null }),
        upload: {
          endpoint: 'https://video.example/tusupload',
          headers: { VideoId: 'video-1', AuthorizationSignature: 'signature' },
          expiresAt: '2026-10-07T16:00:00.000Z',
        },
      },
      [`GET ${BASE}/videos/video-1`]: buildVideo(),
    });
    renderScreen(
      <VideoUploadField purpose="exercise" video={null} onVideoChange={onVideoChange} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Añadir vídeo' }));

    await waitFor(() => {
      expect(onVideoChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'video-1' }));
    });
    expect(findApiCall('POST', `${BASE}/videos`)?.body).toEqual({
      title: 'sentadilla',
      sizeBytes: 50_000_000,
      purpose: 'exercise',
    });
    expect(uploadWithTus).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'https://video.example/tusupload',
        headers: { VideoId: 'video-1', AuthorizationSignature: 'signature' },
        metadata: { filetype: 'video/quicktime', title: 'sentadilla' },
        totalBytes: 50_000_000,
      }),
    );
  });

  it('refuses a video that is too big before reserving anything', async () => {
    pickAsset({ fileSize: 600 * 1_048_576 });
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    renderScreen(
      <VideoUploadField purpose="exercise" video={null} onVideoChange={onVideoChange} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Añadir vídeo' }));

    expect(
      await screen.findByText('El vídeo pesa más de 500 MB. Elige uno más corto o comprímelo.'),
    ).toBeOnTheScreen();
    expect(findApiCall('POST', `${BASE}/videos`)).toBeUndefined();
  });

  it('does nothing when the person closes the gallery without choosing', async () => {
    jest.mocked(launchImageLibraryAsync).mockResolvedValue({ canceled: true, assets: null });
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    renderScreen(
      <VideoUploadField purpose="exercise" video={null} onVideoChange={onVideoChange} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Añadir vídeo' }));

    await waitFor(() => {
      expect(launchImageLibraryAsync).toHaveBeenCalled();
    });
    expect(findApiCall('POST', `${BASE}/videos`)).toBeUndefined();
    expect(onVideoChange).not.toHaveBeenCalled();
  });

  it.each([
    {
      code: 'VIDEO_QUOTA_EXCEEDED',
      status: 409,
      text: 'Tu centro ha llenado su espacio de vídeo. Borra alguno para poder subir otro.',
    },
    {
      code: 'TECHNIQUE_VIDEO_LIMIT_REACHED',
      status: 409,
      text: 'Ya tienes tres vídeos de técnica. Borra uno para subir otro.',
    },
  ])('explains $code when the server refuses the upload', async ({ code, status, text }) => {
    pickAsset();
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`POST ${BASE}/videos`]: () => {
        throw buildApiError(code, status);
      },
    });
    renderScreen(
      <VideoUploadField purpose="technique" video={null} onVideoChange={onVideoChange} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Añadir vídeo' }));

    expect(await screen.findByText(text)).toBeOnTheScreen();
  });

  it('removes the video and tells the parent', async () => {
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`DELETE ${BASE}/videos/video-1`]: null,
    });
    renderScreen(
      <VideoUploadField
        purpose="exercise"
        video={buildVideo()}
        onVideoChange={onVideoChange}
        accessibilityName="Sentadilla"
      />,
    );

    expect(screen.getByRole('button', { name: 'Cambiar vídeo: Sentadilla' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Quitar vídeo: Sentadilla' }));

    await waitFor(() => {
      expect(onVideoChange).toHaveBeenCalledWith(null);
    });
  });
});

describe('PlayableVideo', () => {
  it('shows the thumbnail with its duration and plays the video when it is tapped', () => {
    renderScreen(<PlayableVideo video={buildVideo({ title: 'Hola, soy Marta' })} />);

    expect(screen.getByText('6:12')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Reproducir Hola, soy Marta' }));

    expect(screen.getByLabelText('Vídeo: Hola, soy Marta')).toBeOnTheScreen();
    expect(useVideoPlayer).toHaveBeenCalledWith(
      {
        uri: 'https://video.example/video-1/playlist.m3u8',
        headers: { Referer: 'https://yoclick.app/' },
      },
      expect.any(Function),
    );
  });

  it('keeps asking while the video is processing and refreshes the screens when it is ready', async () => {
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`GET ${BASE}/videos/video-1`]: buildVideo(),
    });
    renderScreen(<PlayableVideo video={buildVideo({ status: 'processing', playback: null })} />);

    expect(screen.getByText('Procesando el vídeo. Puedes seguir usando la app.')).toBeOnTheScreen();
    await waitFor(() => {
      expect(findApiCall('GET', `${BASE}/videos/video-1`)).toBeDefined();
    });
  });

  it('does not ask the server about a video that is already ready', () => {
    mockApi({ 'GET /v1/me/memberships': { memberships: [] } });
    renderScreen(<PlayableVideo video={buildVideo()} />);

    expect(findApiCall('GET', `${BASE}/videos/video-1`)).toBeUndefined();
  });

  it('tells the person when the player cannot play the video, with the reason', () => {
    renderScreen(<PlayableVideo video={buildVideo({ title: 'Hola, soy Marta' })} />);
    fireEvent.press(screen.getByRole('button', { name: 'Reproducir Hola, soy Marta' }));
    const player = jest.mocked(useVideoPlayer).mock.results.at(-1)?.value as {
      addListener: jest.Mock;
    };
    const [, handler] = player.addListener.mock.calls.at(-1) as [
      string,
      (event: { status: string; error?: { message: string } }) => void,
    ];

    act(() => {
      handler({ status: 'error', error: { message: 'HTTP 403' } });
    });

    expect(
      screen.getByText(
        'No se puede reproducir este vídeo ahora. Comprueba tu conexión y vuelve a abrirlo.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText('HTTP 403')).toBeOnTheScreen();
  });

  it.each([
    { caseName: 'processing', status: 'processing', text: 'Procesando' },
    { caseName: 'failed', status: 'failed', text: 'Con error' },
  ])('says the video is $caseName instead of offering to play it', ({ status, text }) => {
    renderScreen(
      <PlayableVideo
        video={buildVideo({ status: status as VideoResponseDto['status'], playback: null })}
      />,
    );

    expect(screen.getByText(text)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Reproducir/ })).toBeNull();
  });
});
