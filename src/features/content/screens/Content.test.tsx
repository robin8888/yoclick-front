import { act, configure, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Modal, Platform } from 'react-native';

import { ClientContentSection } from '@/features/content';
import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { ContentLibraryScreen } from './ContentLibraryScreen';
import { MediaScreen } from './MediaScreen';

// Con toda la suite en paralelo la primera pantalla tarda más de un segundo en aparecer.
const SLOW_MACHINE_ASYNC_TIMEOUT_MS = 5000;
configure({ asyncUtilTimeout: SLOW_MACHINE_ASYNC_TIMEOUT_MS });

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file:///cache/foto.jpg', width: 3000, height: 2000 }],
    }),
  ),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: {
    manipulate: jest.fn(() => ({
      resize: jest.fn(),
      renderAsync: () =>
        Promise.resolve({ saveAsync: () => Promise.resolve({ uri: 'file:///cache/small.jpg' }) }),
    })),
  },
  SaveFormat: { JPEG: 'jpeg' },
}));

const BASE = `/v1/centers/${NORTE_CENTER_ID}`;
const PDF_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789a1';
const VIDEO_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789a2';
const CREATED_AT = '2026-10-09T10:00:00.000Z';
const MEMBERSHIPS = (role: string): unknown => ({
  memberships: [
    {
      membershipId: 'm1',
      centerId: NORTE_CENTER_ID,
      role,
      center: { sectorId: 'gym', name: 'Gimnasio Norte' },
    },
  ],
});
const PDF_CONTENT = {
  id: PDF_ID,
  kind: 'pdf',
  title: 'Guía de calentamiento',
  need: 'Movilidad',
  level: 'beginner',
  sizeBytes: 3_145_728,
  pageCount: 6,
  durationSeconds: null,
  isReady: true,
  thumbnailUrl: null,
  createdAt: CREATED_AT,
  assignments: [
    { id: 'a1', level: 'intermediate', groupId: null, clientMembershipId: null, label: null },
  ],
};
const VIDEO_CONTENT = {
  ...PDF_CONTENT,
  id: VIDEO_ID,
  kind: 'video',
  title: 'Sentadilla explicada',
  need: 'Fuerza',
  level: 'intermediate',
  pageCount: null,
  durationSeconds: 570,
  thumbnailUrl: 'https://video.example/v/thumbnail.jpg',
  assignments: [],
};
const LIBRARY = {
  items: [PDF_CONTENT, VIDEO_CONTENT],
  storage: { limitBytes: 1_073_741_824, usedBytes: 3_145_728 },
};

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

/** En iOS el selector se abre cuando la hoja «¿Qué quieres subir?» avisa de que ya se cerró. */
function finishClosingUploadKindSheet(): void {
  const sheet = screen.UNSAFE_getAllByType(Modal).find((modal) => modal.props.onDismiss);
  act(() => {
    (sheet?.props as { onDismiss?: () => void } | undefined)?.onDismiss?.();
  });
}

describe('ContentLibraryScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('lists each piece with who it is for, in the words of the sector', async () => {
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS('owner'), [`GET ${BASE}/content`]: LIBRARY });
    renderScreen(<ContentLibraryScreen />);

    expect(await screen.findByText('Guía de calentamiento')).toBeOnTheScreen();
    expect(await screen.findByText('Nivel: Base')).toBeOnTheScreen();
    expect(screen.getByText('Sin asignar')).toBeOnTheScreen();
    expect(screen.getByText('Movilidad')).toBeOnTheScreen();
    expect(screen.getByText('2 elementos')).toBeOnTheScreen();
    expect(screen.getByText('Espacio de PDF: 3 MB de 1 GB')).toBeOnTheScreen();
    expect(screen.getByText('Vídeos, PDF e imágenes para tus clientes')).toBeOnTheScreen();
  });

  it('invites to upload the first piece when the library is empty', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: { items: [], storage: LIBRARY.storage },
    });
    renderScreen(<ContentLibraryScreen />);

    expect(await screen.findByText('Tu biblioteca está vacía')).toBeOnTheScreen();
  });

  it('offers retrying when the library cannot be loaded', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<ContentLibraryScreen />);

    expect(await screen.findByText('No hemos podido cargar la biblioteca')).toBeOnTheScreen();
  });

  it('asks what to upload when the upload box is pressed', async () => {
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS('owner'), [`GET ${BASE}/content`]: LIBRARY });
    renderScreen(<ContentLibraryScreen />);
    await screen.findByText('Guía de calentamiento');

    fireEvent.press(screen.getByRole('button', { name: 'Subir contenido' }));

    expect(screen.getByText('¿Qué quieres subir?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'PDF' })).toBeOnTheScreen();
  });

  it('assigns a piece to a level and sends the whole list of targets', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: LIBRARY,
      [`GET ${BASE}/groups`]: { groups: [] },
      [`GET ${BASE}/clients`]: { clients: [], nextCursor: null },
      [`PUT ${BASE}/content/${VIDEO_ID}/assignments`]: VIDEO_CONTENT,
    });
    renderScreen(<ContentLibraryScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Asignar Sentadilla explicada' }));

    fireEvent.press(await screen.findByRole('checkbox', { name: 'Base' }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar asignación' }));

    await waitFor(() => {
      expect(findApiCall('PUT', `${BASE}/content/${VIDEO_ID}/assignments`)?.body).toEqual({
        targets: [{ kind: 'level', level: 'intermediate' }],
      });
    });
  });

  it('opens the assignment with what is already assigned marked', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: LIBRARY,
      [`GET ${BASE}/groups`]: { groups: [] },
      [`GET ${BASE}/clients`]: { clients: [], nextCursor: null },
    });
    renderScreen(<ContentLibraryScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Asignar Guía de calentamiento' }));

    expect(await screen.findByRole('checkbox', { name: 'Base', checked: true })).toBeOnTheScreen();
    expect(screen.getByText('«Guía de calentamiento»')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Inicio', checked: false })).toBeOnTheScreen();
  });

  it('marks the person chosen in the list and unmarks it when pressed again', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: LIBRARY,
      [`GET ${BASE}/groups`]: { groups: [] },
      [`GET ${BASE}/clients`]: {
        clients: [{ membershipId: 'membership-laura', fullName: 'Laura Pérez', photoUrl: null }],
        nextCursor: null,
      },
    });
    renderScreen(<ContentLibraryScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Asignar Sentadilla explicada' }));

    fireEvent.press(await screen.findByRole('button', { name: 'Laura Pérez' }));
    expect(screen.getByRole('button', { name: 'Laura Pérez', selected: true })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Laura Pérez', selected: true }));
    expect(screen.getByRole('button', { name: 'Laura Pérez', selected: false })).toBeOnTheScreen();
  });

  it('changes the title, the level and the need of a piece', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: LIBRARY,
      [`PATCH ${BASE}/content/${PDF_ID}`]: PDF_CONTENT,
    });
    renderScreen(<ContentLibraryScreen />);
    fireEvent.press(
      await screen.findByRole('button', { name: 'Detalles de Guía de calentamiento' }),
    );

    fireEvent.changeText(
      screen.getByLabelText('Nombre: qué ejercicio o guía es'),
      'Calentamiento completo',
    );
    fireEvent.press(screen.getByRole('radio', { name: 'Avanzado' }));
    fireEvent.press(await screen.findByRole('radio', { name: 'Fuerza' }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', `${BASE}/content/${PDF_ID}`)?.body).toEqual({
        title: 'Calentamiento completo',
        level: 'advanced',
        need: 'Fuerza',
      });
    });
  });

  it('asks before deleting a piece and deletes it once confirmed', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: LIBRARY,
      [`DELETE ${BASE}/content/${PDF_ID}`]: undefined,
    });
    renderScreen(<ContentLibraryScreen />);
    fireEvent.press(
      await screen.findByRole('button', { name: 'Detalles de Guía de calentamiento' }),
    );

    fireEvent.press(screen.getByRole('button', { name: 'Borrar' }));
    expect(screen.getByText('¿Borrar este contenido?')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Sí, borrar' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', `${BASE}/content/${PDF_ID}`)).toBeDefined();
    });
  });

  it('uploads the PDF that was chosen, titled with its file name', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: LIBRARY,
      [`POST ${BASE}/content/documents`]: PDF_CONTENT,
    });
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['%PDF-1.4'])),
    } as Response);
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
      canceled: false,
      assets: [
        { uri: 'file:///cache/guia.pdf', name: 'Guía nueva.pdf', size: 2048, lastModified: 0 },
      ],
    });
    renderScreen(<ContentLibraryScreen />);
    await screen.findByText('Guía de calentamiento');

    fireEvent.press(screen.getByRole('button', { name: 'Subir contenido' }));
    fireEvent.press(screen.getByRole('button', { name: 'PDF' }));
    finishClosingUploadKindSheet();

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/content/documents`)?.path).toContain('title=Gu');
    });
    expect(await screen.findByRole('heading', { name: 'Título y etiqueta' })).toBeOnTheScreen();
    expect(screen.getByText('Etiqueta: de qué trata')).toBeOnTheScreen();
  });

  it('uploads an image from the gallery and then asks for its title and label', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('owner'),
      [`GET ${BASE}/content`]: LIBRARY,
      [`POST ${BASE}/content/images`]: { ...PDF_CONTENT, kind: 'image', pageCount: null },
    });
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['jpeg'])),
    } as Response);
    renderScreen(<ContentLibraryScreen />);
    await screen.findByText('Guía de calentamiento');

    fireEvent.press(screen.getByRole('button', { name: 'Subir contenido' }));
    fireEvent.press(screen.getByRole('button', { name: 'Imagen' }));
    finishClosingUploadKindSheet();

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/content/images`)?.path).toContain('title=Nueva');
    });
    expect(await screen.findByRole('heading', { name: 'Título y etiqueta' })).toBeOnTheScreen();
  });

  it('waits for the choice sheet to close before opening the file picker on iOS', async () => {
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS('owner'), [`GET ${BASE}/content`]: LIBRARY });
    jest.mocked(DocumentPicker.getDocumentAsync).mockClear();
    jest
      .mocked(DocumentPicker.getDocumentAsync)
      .mockResolvedValue({ canceled: true, assets: null });
    renderScreen(<ContentLibraryScreen />);
    await screen.findByText('Guía de calentamiento');

    fireEvent.press(screen.getByRole('button', { name: 'Subir contenido' }));
    fireEvent.press(screen.getByRole('button', { name: 'PDF' }));
    expect(DocumentPicker.getDocumentAsync).not.toHaveBeenCalled();
    finishClosingUploadKindSheet();

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('opens the file picker at once on Android, which has no such wait', async () => {
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS('owner'), [`GET ${BASE}/content`]: LIBRARY });
    jest.mocked(DocumentPicker.getDocumentAsync).mockClear();
    jest
      .mocked(DocumentPicker.getDocumentAsync)
      .mockResolvedValue({ canceled: true, assets: null });
    const originalOs = Platform.OS;
    Platform.OS = 'android';
    renderScreen(<ContentLibraryScreen />);
    await screen.findByText('Guía de calentamiento');

    fireEvent.press(screen.getByRole('button', { name: 'Subir contenido' }));
    fireEvent.press(screen.getByRole('button', { name: 'PDF' }));
    Platform.OS = originalOs;

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('refuses a PDF over 50 MB without sending it', async () => {
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS('owner'), [`GET ${BASE}/content`]: LIBRARY });
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///cache/enorme.pdf',
          name: 'enorme.pdf',
          size: 60 * 1_048_576,
          lastModified: 0,
        },
      ],
    });
    renderScreen(<ContentLibraryScreen />);
    await screen.findByText('Guía de calentamiento');

    fireEvent.press(screen.getByRole('button', { name: 'Subir contenido' }));
    fireEvent.press(screen.getByRole('button', { name: 'PDF' }));
    finishClosingUploadKindSheet();

    expect(
      await screen.findByText('El PDF pesa más de 50 MB. Elige uno más pequeño.'),
    ).toBeOnTheScreen();
    expect(findApiCall('POST', `${BASE}/content/documents`)).toBeUndefined();
  });
});

describe('ContentLibraryScreen for the team', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('lets the team assign but not upload, edit or delete', async () => {
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS('staff'), [`GET ${BASE}/content`]: LIBRARY });
    renderScreen(<ContentLibraryScreen canManageLibrary={false} onBackPress={jest.fn()} />);

    expect(await screen.findByText('Guía de calentamiento')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Subir contenido' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Detalles de/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Asignar Guía de calentamiento' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Volver' })).toBeOnTheScreen();
  });

  it('assigns a piece the same way the administration does', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/content`]: LIBRARY,
      [`GET ${BASE}/groups`]: { groups: [] },
      [`GET ${BASE}/clients`]: { clients: [], nextCursor: null },
      [`PUT ${BASE}/content/${VIDEO_ID}/assignments`]: VIDEO_CONTENT,
    });
    renderScreen(<ContentLibraryScreen canManageLibrary={false} />);
    fireEvent.press(await screen.findByRole('button', { name: 'Asignar Sentadilla explicada' }));

    fireEvent.press(screen.getByRole('checkbox', { name: 'Avanzado' }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar asignación' }));

    await waitFor(() => {
      expect(findApiCall('PUT', `${BASE}/content/${VIDEO_ID}/assignments`)?.body).toEqual({
        targets: [{ kind: 'level', level: 'advanced' }],
      });
    });
  });

  it('tells the team to wait for the administration when there is nothing yet', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('staff'),
      [`GET ${BASE}/content`]: { items: [], storage: LIBRARY.storage },
    });
    renderScreen(<ContentLibraryScreen canManageLibrary={false} />);

    expect(await screen.findByText(/La administración del centro lo sube/)).toBeOnTheScreen();
  });
});

describe('ClientContentSection', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('shows what the center assigned, with the length or pages and what it is about', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/my-content`]: { items: [PDF_CONTENT, VIDEO_CONTENT] },
    });
    renderScreen(<ClientContentSection />);

    expect(await screen.findByText('Sentadilla explicada')).toBeOnTheScreen();
    expect(screen.getByText('9:30')).toBeOnTheScreen();
    expect(screen.getByText('6 págs.')).toBeOnTheScreen();
    expect(await screen.findByText('Vídeo · Base · Fuerza')).toBeOnTheScreen();
    expect(screen.getByText('2 resultados')).toBeOnTheScreen();
  });

  it('filters only by need: the client does not pick a level', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/my-content`]: { items: [PDF_CONTENT, VIDEO_CONTENT] },
    });
    renderScreen(<ClientContentSection />);
    await screen.findByText('Sentadilla explicada');

    expect(screen.queryByRole('radio', { name: 'Inicio' })).toBeNull();
    expect(screen.queryByRole('radio', { name: 'Avanzado' })).toBeNull();

    fireEvent.press(await screen.findByRole('radio', { name: 'Fuerza' }));
    expect(screen.getByText('1 resultado')).toBeOnTheScreen();
  });

  it('opens a piece when its card is pressed', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/my-content`]: { items: [VIDEO_CONTENT] },
    });
    renderScreen(<ClientContentSection />);

    fireEvent.press(await screen.findByRole('button', { name: /Sentadilla explicada/ }));

    expect(getMockRouter().push).toHaveBeenCalledWith(`/(client)/content/${VIDEO_ID}`);
  });

  it('explains there is nothing yet when nothing has been assigned', async () => {
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/my-content`]: { items: [] },
    });
    renderScreen(<ClientContentSection />);

    expect(await screen.findByText('Todavía no tienes contenido')).toBeOnTheScreen();
  });
});

describe('MediaScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('plays an assigned video and describes it', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: VIDEO_ID });
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/my-content/${VIDEO_ID}`]: {
        ...VIDEO_CONTENT,
        playback: {
          streamUrl: 'https://video.example/v/playlist.m3u8',
          thumbnailUrl: 'https://video.example/v/thumbnail.jpg',
          expiresAt: '2026-10-09T14:00:00.000Z',
        },
        document: null,
      },
    });
    renderScreen(<MediaScreen />);

    expect(
      await screen.findByRole('button', { name: 'Reproducir Sentadilla explicada' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Fuerza')).toBeOnTheScreen();
    expect(screen.getByText(/Grabado por el equipo de Gimnasio Norte/)).toBeOnTheScreen();
  });

  it('shows an assigned image and describes it', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: PDF_ID });
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/my-content/${PDF_ID}`]: {
        ...PDF_CONTENT,
        kind: 'image',
        title: 'Postura correcta',
        pageCount: null,
        playback: null,
        document: null,
        image: { url: 'https://files.example/postura.jpg', expiresAt: '2026-10-09T14:00:00.000Z' },
      },
    });
    renderScreen(<MediaScreen />);

    expect(await screen.findByLabelText('Postura correcta')).toBeOnTheScreen();
    expect(screen.getByText(/Imagen compartida por el equipo de Gimnasio Norte/)).toBeOnTheScreen();
    expect(screen.getByText('Movilidad')).toBeOnTheScreen();
  });

  it('opens an assigned PDF in the reader of the phone', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: PDF_ID });
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockApi({
      'GET /v1/me/memberships': MEMBERSHIPS('client'),
      [`GET ${BASE}/my-content/${PDF_ID}`]: {
        ...PDF_CONTENT,
        playback: null,
        document: { url: 'https://files.example/guia.pdf', expiresAt: '2026-10-09T14:00:00.000Z' },
      },
    });
    renderScreen(<MediaScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Abrir PDF' }));

    expect(openUrl).toHaveBeenCalledWith('https://files.example/guia.pdf');
    expect(screen.getByText('6 págs.')).toBeOnTheScreen();
    expect(screen.getByText('3 MB')).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Guía PDF' })).toBeOnTheScreen();
  });

  it('goes back to the start when the link is not a valid piece', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'no-es-un-uuid' });
    mockApi({ 'GET /v1/me/memberships': MEMBERSHIPS('client') });
    renderScreen(<MediaScreen />);

    expect(screen.getByText('redirect:/')).toBeOnTheScreen();
  });
});
