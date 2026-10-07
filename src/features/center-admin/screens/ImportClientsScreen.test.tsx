import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { ImportClientsScreen } from './ImportClientsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

const IMPORT_PATH = `/v1/centers/${NORTE_CENTER_ID}/clients/import`;
const CSV_TEXT = [
  'Nombre;Correo;Teléfono;Nivel',
  'Ana Pérez;ana@example.test;600111222;Avanzado',
  'Sin correo;;;',
  'Ana repetida;ANA@example.test;;',
  'Luis Gómez;luis@example.test;;',
].join('\n');

function signInAsOwner(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

function pickFileWithText(text: string): void {
  jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
    canceled: false,
    assets: [
      { uri: 'file:///clientes.csv', name: 'clientes.csv', size: text.length, lastModified: 0 },
    ],
  });
  global.fetch = jest.fn(() => Promise.resolve({ text: () => Promise.resolve(text) })) as never;
}

async function chooseFile(): Promise<void> {
  fireEvent.press(await screen.findByRole('button', { name: 'Elegir archivo CSV' }));
}

describe('ImportClientsScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInAsOwner();
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`POST ${IMPORT_PATH}`]: {
        createdCount: 2,
        updatedCount: 0,
        skipped: [{ rowNumber: 2, email: null, reason: 'missing_email' }],
      },
    });
  });

  it('guesses the columns of the file and lets the person review before sending', async () => {
    pickFileWithText(CSV_TEXT);
    renderScreen(<ImportClientsScreen />);

    await chooseFile();

    expect(await screen.findByText(/Hemos leído 4 filas de «clientes.csv»/)).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Nombre', checked: true })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Revisar' }));
    expect(await screen.findByLabelText('2 se importarán')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 sin correo válido')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 repetidas')).toBeOnTheScreen();
  });

  it('sends the rows, shows the report and lists what was left out', async () => {
    pickFileWithText(CSV_TEXT);
    renderScreen(<ImportClientsScreen />);
    await chooseFile();
    fireEvent.press(await screen.findByRole('button', { name: 'Revisar' }));

    fireEvent.press(await screen.findByRole('button', { name: 'Importar 2' }));

    expect(await screen.findByText('Importación completada')).toBeOnTheScreen();
    expect(screen.getByText('2 nuevos · 0 actualizados')).toBeOnTheScreen();
    expect(screen.getByText(/Fila 2/)).toBeOnTheScreen();
    expect(screen.getByText(/Sin correo válido/)).toBeOnTheScreen();
    expect(findApiCall('POST', IMPORT_PATH)?.body).toEqual({
      rows: [
        { fullName: 'Ana Pérez', email: 'ana@example.test', phone: '600111222', level: 'advanced' },
        { fullName: 'Sin correo', email: null, phone: null, level: null },
        { fullName: 'Ana repetida', email: 'ANA@example.test', phone: null, level: null },
        { fullName: 'Luis Gómez', email: 'luis@example.test', phone: null, level: null },
      ],
    });
  });

  it('goes to the clients list when the import is done', async () => {
    pickFileWithText(CSV_TEXT);
    renderScreen(<ImportClientsScreen />);
    await chooseFile();
    fireEvent.press(await screen.findByRole('button', { name: 'Revisar' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Importar 2' }));

    fireEvent.press(await screen.findByRole('button', { name: /^Ver / }));

    expect(getMockRouter().replace).toHaveBeenCalledWith('/(admin)/(tabs)/clients');
  });

  it('shows an error when the file has no data rows and stays on the first step', async () => {
    pickFileWithText('Nombre,Correo\n');
    renderScreen(<ImportClientsScreen />);

    await chooseFile();

    expect(await screen.findByText('El archivo no tiene filas con datos.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Elegir archivo CSV' })).toBeOnTheScreen();
  });

  it('does nothing when the person closes the file picker', async () => {
    jest
      .mocked(DocumentPicker.getDocumentAsync)
      .mockResolvedValue({ canceled: true, assets: null });
    renderScreen(<ImportClientsScreen />);

    await chooseFile();

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    });
    expect(screen.getByRole('button', { name: 'Elegir archivo CSV' })).toBeOnTheScreen();
  });

  it('shows the server message when the import fails', async () => {
    mockApi({
      'GET /v1/me/memberships': { memberships: [] },
      [`POST ${IMPORT_PATH}`]: () => {
        throw new Error('boom');
      },
    });
    pickFileWithText(CSV_TEXT);
    renderScreen(<ImportClientsScreen />);
    await chooseFile();
    fireEvent.press(await screen.findByRole('button', { name: 'Revisar' }));

    fireEvent.press(await screen.findByRole('button', { name: 'Importar 2' }));

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
    expect(screen.queryByText('Importación completada')).not.toBeOnTheScreen();
  });
});
