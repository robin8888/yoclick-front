import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';
import { getTodayIsoDate } from '@/shared/lib/format';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { freezeClockAt, restoreClock } from '@/test/freeze-clock';
import { renderScreen } from '@/test/render-screen';

import { getDeviceTimeZone } from '../hooks/useCenterTimeZone';
import { EnrollClientsScreen } from './EnrollClientsScreen';
import { ManagementScreen } from './ManagementScreen';
import { NewScheduleScreen } from './NewScheduleScreen';
import { ScheduleSeriesScreen } from './ScheduleSeriesScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const ROOMS_PATH = `${CENTER_PATH}/rooms`;
const TEAM_PATH = `${CENTER_PATH}/team`;
const SERVICES_PATH = `${CENTER_PATH}/services`;
const SCHEDULES_PATH = `${CENTER_PATH}/schedules`;
const SERIES_ID = '0191d6a0-0000-7000-8000-0000000000e1';
const ENROLLMENT_ID = '0191d6a0-0000-7000-8000-0000000000e2';
const ROOM_ID = '0191d6a0-0000-7000-8000-0000000000f1';
const TEACHER_ANA_ID = '0191d6a0-0000-7000-8000-0000000000b1';
const ENGLISH_ID = '0191d6a0-0000-7000-8000-0000000000a1';
const MARTA_ID = '0191d6a0-0000-7000-8000-0000000000d1';

const SERIES = {
  seriesId: SERIES_ID,
  label: null,
  mode: 'group',
  capacity: 12,
  status: 'active',
  startsOn: '2026-10-12',
  endsOn: null,
  service: { id: ENGLISH_ID, name: 'Inglés B1', color: null },
  staff: { membershipId: TEACHER_ANA_ID, fullName: 'Ana Ruiz' },
  room: { id: ROOM_ID, name: 'Aula 2' },
  days: [
    { scheduleId: 'd-mon', weekday: 1, startsAtTime: '18:00', endsAtTime: '19:30' },
    { scheduleId: 'd-thu', weekday: 4, startsAtTime: '18:00', endsAtTime: '19:30' },
  ],
  enrolledCount: 8,
};

const ROOMS = {
  rooms: [
    {
      id: ROOM_ID,
      name: 'Aula 2',
      capacity: 12,
      staff: { membershipId: TEACHER_ANA_ID, fullName: 'Ana Ruiz' },
      fixedService: null,
      services: [],
    },
  ],
};

const SERVICES = {
  services: [
    {
      id: ENGLISH_ID,
      name: 'Inglés B1',
      description: null,
      kind: 'individual',
      mode: 'both',
      durationMinutes: 90,
      priceCents: null,
      currency: 'EUR',
      color: null,
      bookingWindowDays: 30,
      minNoticeMinutes: 60,
      isVisible: true,
      room: null,
      staff: [],
    },
  ],
};

const TEAM = {
  members: [
    {
      membershipId: TEACHER_ANA_ID,
      userId: 'user-ana',
      fullName: 'Ana Ruiz',
      email: 'ana@example.com',
      role: 'staff',
      status: 'active',
      staffTitle: null,
      photoUrl: null,
      permissions: [],
      joinedAt: '2026-01-01T09:00:00.000Z',
    },
  ],
};

const ENROLLMENTS = {
  enrollments: [
    {
      id: ENROLLMENT_ID,
      client: { membershipId: MARTA_ID, fullName: 'Marta Ruiz' },
      startsOn: '2026-10-12',
      endsOn: null,
      status: 'active',
      createdAt: '2026-10-12T10:00:00.000Z',
    },
  ],
};

function signInToCenter(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('ManagementScreen · fixed schedules', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS, [`GET ${SCHEDULES_PATH}`]: { series: [SERIES] } });
  });

  it('shows the schedules of the chosen weekday with place, teacher, mode and seats', async () => {
    renderScreen(<ManagementScreen />);

    fireEvent.press(await screen.findByRole('radio', { name: 'Lunes' }));

    expect(await screen.findByText('Inglés B1')).toBeOnTheScreen();
    expect(screen.getByText('18:00 – 19:30')).toBeOnTheScreen();
    expect(
      screen.getByText('Aula 2 · Ana Ruiz · En grupo · 8 de 12 matriculados'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('radio', { name: 'Martes' }));

    expect(screen.getByText('Nada programado el Martes')).toBeOnTheScreen();
  });

  it('opens a schedule and the form for a new one', async () => {
    renderScreen(<ManagementScreen />);
    fireEvent.press(await screen.findByRole('radio', { name: 'Lunes' }));

    fireEvent.press(await screen.findByRole('button', { name: /18:00–19:30, Inglés B1/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Nuevo horario' }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/schedules/[seriesId]',
      params: { seriesId: SERIES_ID },
    });
    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/schedules/new');
  });
});

describe('NewScheduleScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
  });

  it('creates a weekly group class in a room with its fixed teacher', async () => {
    mockApi({
      [`GET ${ROOMS_PATH}`]: ROOMS,
      [`GET ${SERVICES_PATH}`]: SERVICES,
      [`GET ${TEAM_PATH}`]: TEAM,
      [`POST ${SCHEDULES_PATH}`]: { series: SERIES, skipped: [] },
    });
    renderScreen(<NewScheduleScreen />);

    fireEvent.press(await screen.findByRole('radio', { name: 'Inglés B1' }));
    fireEvent.press(screen.getByRole('checkbox', { name: 'Lunes' }));
    fireEvent.press(await screen.findByRole('radio', { name: 'Aula 2' }));
    expect(
      await screen.findByRole('radio', { name: 'El del espacio (Ana Ruiz)' }),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Crear horario' }));

    await waitFor(() => {
      expect(getMockRouter().back).toHaveBeenCalled();
    });
    expect(findApiCall('POST', SCHEDULES_PATH)?.body).toEqual({
      serviceId: ENGLISH_ID,
      weekdays: [1],
      startsAtTime: '18:00',
      endsAtTime: '19:00',
      mode: 'group',
      startsOn: getTodayIsoDate(new Date(), getDeviceTimeZone()),
      endsOn: null,
      roomId: ROOM_ID,
    });
  });

  it('asks for a service and a day before saving', async () => {
    mockApi({
      [`GET ${ROOMS_PATH}`]: ROOMS,
      [`GET ${SERVICES_PATH}`]: SERVICES,
      [`GET ${TEAM_PATH}`]: TEAM,
    });
    renderScreen(<NewScheduleScreen />);
    fireEvent.press(await screen.findByRole('radio', { name: 'Inglés B1' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Ana Ruiz' }));

    fireEvent.press(screen.getByRole('button', { name: 'Crear horario' }));

    expect(await screen.findByText('Elige al menos un día')).toBeOnTheScreen();
    expect(findApiCall('POST', SCHEDULES_PATH)).toBeUndefined();
  });

  it('lists the sessions the server could not create', async () => {
    mockApi({
      [`GET ${ROOMS_PATH}`]: ROOMS,
      [`GET ${SERVICES_PATH}`]: SERVICES,
      [`GET ${TEAM_PATH}`]: TEAM,
      [`POST ${SCHEDULES_PATH}`]: {
        series: SERIES,
        skipped: [{ date: '2026-10-25', startsAtTime: '18:00', reason: 'holiday' }],
      },
    });
    renderScreen(<NewScheduleScreen />);
    fireEvent.press(await screen.findByRole('radio', { name: 'Inglés B1' }));
    fireEvent.press(screen.getByRole('checkbox', { name: 'Lunes' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Ana Ruiz' }));

    fireEvent.press(screen.getByRole('button', { name: 'Crear horario' }));

    expect(await screen.findByText('25/10/2026 18:00 · cierre del centro')).toBeOnTheScreen();
    expect(getMockRouter().back).not.toHaveBeenCalled();
  });
});

describe('ScheduleSeriesScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ seriesId: SERIES_ID });
  });

  it('shows the group and removes a person from it after confirming', async () => {
    mockApi({
      [`GET ${SCHEDULES_PATH}`]: { series: [SERIES] },
      [`GET ${SCHEDULES_PATH}/${SERIES_ID}/enrollments`]: ENROLLMENTS,
      [`DELETE ${SCHEDULES_PATH}/${SERIES_ID}/enrollments/${ENROLLMENT_ID}`]: {
        cancelledBookingCount: 3,
      },
    });
    renderScreen(<ScheduleSeriesScreen />);

    expect(await screen.findByText('lun y jue · 18:00–19:30')).toBeOnTheScreen();
    expect(await screen.findByText('Marta Ruiz')).toBeOnTheScreen();
    expect(screen.getByText('Grupo fijo · 1 de 12')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Dar de baja a Marta Ruiz' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Dar de baja' }));

    await waitFor(() => {
      expect(
        findApiCall('DELETE', `${SCHEDULES_PATH}/${SERIES_ID}/enrollments/${ENROLLMENT_ID}`),
      ).toBeDefined();
    });
  });

  it('opens the enrolment picker and ends the schedule after confirming', async () => {
    mockApi({
      [`GET ${SCHEDULES_PATH}`]: { series: [SERIES] },
      [`GET ${SCHEDULES_PATH}/${SERIES_ID}/enrollments`]: { enrollments: [] },
      [`POST ${SCHEDULES_PATH}/${SERIES_ID}/end`]: { keptSessionCount: 0 },
    });
    renderScreen(<ScheduleSeriesScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Matricular' }));
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/schedules/enroll/[seriesId]',
      params: { seriesId: SERIES_ID },
    });

    fireEvent.press(screen.getByRole('button', { name: 'Terminar horario' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Terminar' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${SCHEDULES_PATH}/${SERIES_ID}/end`)).toBeDefined();
    });
    expect(getMockRouter().back).toHaveBeenCalled();
  });
});

describe('EnrollClientsScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    jest.mocked(useLocalSearchParams).mockReturnValue({ seriesId: SERIES_ID });
  });

  it('enrols the chosen people and sums up the result', async () => {
    mockApi({
      [`GET ${SCHEDULES_PATH}`]: { series: [SERIES] },
      [`GET ${CENTER_PATH}/passes/eligible`]: {
        clients: [
          { membershipId: MARTA_ID, fullName: 'Marta Ruiz', photoUrl: null, bookableSessions: 4 },
        ],
      },
      [`POST ${SCHEDULES_PATH}/${SERIES_ID}/enrollments`]: {
        enrollments: ENROLLMENTS.enrollments,
        skipped: [],
        skippedDates: [{ clientMembershipId: MARTA_ID, date: '2026-10-19' }],
      },
    });
    renderScreen(<EnrollClientsScreen />);

    fireEvent.press(await screen.findByText('Marta Ruiz'));
    fireEvent.press(screen.getByRole('button', { name: 'Matricular (1)' }));

    expect(await screen.findByText('1 persona matriculada')).toBeOnTheScreen();
    expect(screen.getByText('1 día con otra cita: ese día no entra')).toBeOnTheScreen();
    expect(findApiCall('POST', `${SCHEDULES_PATH}/${SERIES_ID}/enrollments`)?.body).toEqual({
      clientMembershipIds: [MARTA_ID],
    });
  });
});

describe('ManagementScreen · repeat a configured week', () => {
  const WEEK_ONLY_SERIES = { ...SERIES, startsOn: '2026-10-12', endsOn: '2026-10-18' };

  beforeEach(() => {
    resetMockRouter();
    signInToCenter();
    freezeClockAt('2026-10-14T09:00:00.000Z');
  });

  afterEach(() => {
    restoreClock();
  });

  it('copies the classes of the week to the next one with a single button', async () => {
    mockApi({
      [`GET ${ROOMS_PATH}`]: ROOMS,
      [`GET ${SCHEDULES_PATH}`]: { series: [WEEK_ONLY_SERIES] },
      [`POST ${SCHEDULES_PATH}/repeat-week`]: {
        copiedSeriesCount: 1,
        alreadyCopiedSeriesCount: 0,
        failedSeriesCount: 0,
        skipped: [],
      },
    });
    renderScreen(<ManagementScreen />);

    const repeatButton = await screen.findByRole('button', {
      name: 'Repetir en la semana siguiente',
    });
    await waitFor(() => {
      expect(repeatButton).toBeEnabled();
    });
    fireEvent.press(repeatButton);

    await waitFor(() => {
      expect(findApiCall('POST', `${SCHEDULES_PATH}/repeat-week`)?.body).toEqual({
        weekStart: '2026-10-12',
      });
    });
    expect(await screen.findByText('Copiado 1 horario a la semana siguiente.')).toBeOnTheScreen();
  });

  it('has nothing to copy when the schedules repeat without an end', async () => {
    mockApi({ [`GET ${ROOMS_PATH}`]: ROOMS, [`GET ${SCHEDULES_PATH}`]: { series: [SERIES] } });
    renderScreen(<ManagementScreen />);

    expect(
      await screen.findByRole('button', { name: 'Repetir en la semana siguiente' }),
    ).toBeDisabled();
  });
});
