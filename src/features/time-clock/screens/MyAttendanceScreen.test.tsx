import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { TimeEntryResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { MyAttendanceScreen } from './MyAttendanceScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));

const ENTRIES_PATH = `/v1/centers/${NORTE_CENTER_ID}/me/time-entries`;

function buildEntry(overrides: Partial<TimeEntryResponseDto> = {}): TimeEntryResponseDto {
  return {
    id: 'entry-1',
    staffMembershipId: 'staff-1',
    workDate: '2026-10-05',
    clockInAt: '2026-10-05T07:02:00.000Z',
    clockOutAt: '2026-10-05T12:05:00.000Z',
    isOpen: false,
    workedMinutes: 303,
    inSource: 'qr',
    outSource: 'qr',
    isEdited: false,
    originalClockInAt: null,
    originalClockOutAt: null,
    editedAt: null,
    ...overrides,
  };
}

function buildMonth(entries: TimeEntryResponseDto[]): unknown {
  return {
    month: '2026-10',
    staffMembershipId: 'staff-1',
    entries,
    totals: {
      workedMinutes: entries.reduce((total, entry) => total + entry.workedMinutes, 0),
      daysWorked: new Set(entries.map((entry) => entry.workDate)).size,
      editedCount: entries.filter((entry) => entry.isEdited).length,
    },
  };
}

describe('MyAttendanceScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    freezeClockAt('2026-10-14T10:00:00.000Z');
    act(() => {
      useSessionStore.getState().startSession({
        accessToken: 'token',
        user: { id: 'u1', fullName: 'Ana Pérez', email: 'ana@example.com' },
      });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  afterEach(() => {
    restoreClock();
  });

  it('shows the month with its totals and each entry with its times in the center zone', async () => {
    mockApi({
      [`GET ${ENTRIES_PATH}`]: buildMonth([
        buildEntry(),
        buildEntry({ id: 'entry-2', workDate: '2026-10-06', isEdited: true }),
      ]),
    });
    renderScreen(<MyAttendanceScreen />);

    expect(screen.getByText('Octubre de 2026')).toBeOnTheScreen();
    expect(await screen.findAllByText('09:02 → 14:05')).toHaveLength(2);
    expect(screen.getByText('Editado')).toBeOnTheScreen();
    expect(screen.getByText('10 h 6 min')).toBeOnTheScreen();
  });

  it('says it is still running for an open shift', async () => {
    mockApi({
      [`GET ${ENTRIES_PATH}`]: buildMonth([
        buildEntry({ clockOutAt: null, isOpen: true, workedMinutes: 0 }),
      ]),
    });
    renderScreen(<MyAttendanceScreen />);

    expect(await screen.findByText('09:02 → en curso')).toBeOnTheScreen();
    expect(screen.getByText('En curso')).toBeOnTheScreen();
  });

  it('offers to add a day when the month has no entries', async () => {
    mockApi({ [`GET ${ENTRIES_PATH}`]: buildMonth([]) });
    renderScreen(<MyAttendanceScreen />);

    expect(await screen.findByText('Sin fichajes este mes')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Añadir un día olvidado' })).toBeOnTheScreen();
  });

  it('shows an error with retry when the month cannot be loaded', async () => {
    mockApi({
      [`GET ${ENTRIES_PATH}`]: () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderScreen(<MyAttendanceScreen />);

    expect(await screen.findByText('No hemos podido cargar tu asistencia')).toBeOnTheScreen();
  });

  it('corrects an entry and sends the exact instants to the server', async () => {
    mockApi({
      [`GET ${ENTRIES_PATH}`]: buildMonth([buildEntry()]),
      [`PATCH ${ENTRIES_PATH}/entry-1`]: buildEntry({ isEdited: true }),
    });
    renderScreen(<MyAttendanceScreen />);

    fireEvent.press(await screen.findByRole('button', { name: /09:02 → 14:05/ }));
    fireEvent.press(await screen.findByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(findApiCall('PATCH', `${ENTRIES_PATH}/entry-1`)?.body).toEqual({
        clockInAt: '2026-10-05T07:02:00.000Z',
        clockOutAt: '2026-10-05T12:05:00.000Z',
      });
    });
  });

  it('adds a forgotten day with the default shift', async () => {
    mockApi({
      [`GET ${ENTRIES_PATH}`]: buildMonth([]),
      [`POST ${ENTRIES_PATH}`]: buildEntry({ id: 'new', workDate: '2026-10-14' }),
    });
    renderScreen(<MyAttendanceScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Añadir un día olvidado' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(findApiCall('POST', ENTRIES_PATH)?.body).toEqual({
        clockInAt: '2026-10-14T07:00:00.000Z',
        clockOutAt: '2026-10-14T15:00:00.000Z',
      });
    });
  });

  it('asks before deleting an entry and then removes it', async () => {
    mockApi({
      [`GET ${ENTRIES_PATH}`]: buildMonth([buildEntry()]),
      [`DELETE ${ENTRIES_PATH}/entry-1`]: undefined,
    });
    renderScreen(<MyAttendanceScreen />);

    fireEvent.press(await screen.findByRole('button', { name: /09:02 → 14:05/ }));
    fireEvent.press(await screen.findByRole('button', { name: 'Eliminar fichaje' }));
    expect(findApiCall('DELETE', ENTRIES_PATH)).toBeUndefined();
    fireEvent.press(await screen.findByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', `${ENTRIES_PATH}/entry-1`)).toBeDefined();
    });
  });

  it('builds the PDF report of the month and opens the share sheet', async () => {
    jest.mocked(Print.printToFileAsync).mockResolvedValue({ uri: 'file:///report.pdf' } as never);
    jest.mocked(Sharing.shareAsync).mockResolvedValue(undefined);
    mockApi({ [`GET ${ENTRIES_PATH}`]: buildMonth([buildEntry()]) });
    renderScreen(<MyAttendanceScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Informe del mes (PDF)' }));

    await waitFor(() => {
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file:///report.pdf',
        expect.objectContaining({ mimeType: 'application/pdf' }),
      );
    });
    const [{ html }] = jest.mocked(Print.printToFileAsync).mock.calls[0] as [{ html: string }];
    expect(html).toContain('Octubre de 2026');
    expect(html).toContain('Ana Pérez');
  });
});
