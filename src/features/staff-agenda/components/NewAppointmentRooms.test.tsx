import { fireEvent, screen } from '@testing-library/react-native';

import { renderScreen } from '@/test/render-screen';

import type { NewAppointmentForm } from '../hooks/useNewAppointmentForm';
import { AppointmentModeFields, RoomChoices } from './AppointmentModeFields';
import { GroupRoomOptionsList } from './GroupRoomOptionsList';

const GROUP = {
  sessionId: 'session-1',
  startsAt: '2026-10-12T16:00:00.000Z',
  endsAt: '2026-10-12T17:00:00.000Z',
  serviceName: 'Salsa',
  room: { id: 'room-1', name: 'Sala de baile' },
  capacity: 10,
  bookedCount: 7,
};

function buildForm(overrides: Partial<NewAppointmentForm> = {}): NewAppointmentForm {
  return {
    mode: 'private',
    timeZone: 'Europe/Madrid',
    freeRooms: [],
    roomId: null,
    joinableGroups: [],
    joinSessionId: null,
    selectMode: jest.fn(),
    selectRoom: jest.fn(),
    selectJoinSession: jest.fn(),
    selectGroupSlot: jest.fn(),
    groupRoomOptions: [],
    ...overrides,
  } as unknown as NewAppointmentForm;
}

describe('AppointmentModeFields', () => {
  it('lets the center choose a private or a group appointment', () => {
    const form = buildForm();
    renderScreen(<AppointmentModeFields form={form} />);

    fireEvent.press(screen.getByRole('radio', { name: /Grupal/ }));

    expect(form.selectMode).toHaveBeenCalledWith('group');
  });
});

describe('RoomChoices', () => {
  it('offers the rooms that are free at the chosen hour with their capacity', () => {
    const form = buildForm({
      freeRooms: [
        { id: 'room-1', name: 'Sala de baile', capacity: 10 },
        { id: 'room-2', name: 'Aula común', capacity: 4 },
      ],
      roomId: 'room-1',
    });
    renderScreen(<RoomChoices form={form} />);

    fireEvent.press(screen.getByRole('radio', { name: /Aula común · aforo 4/ }));

    expect(form.selectRoom).toHaveBeenCalledWith('room-2');
  });

  it('says so when no room is free at that hour', () => {
    renderScreen(<RoomChoices form={buildForm()} />);

    expect(
      screen.getByText('No hay ninguna sala libre a esa hora para este profesional.'),
    ).toBeOnTheScreen();
  });
});

describe('GroupRoomOptionsList', () => {
  const ENTRY = {
    room: {
      id: 'room-1',
      name: 'Sala de baile',
      capacity: 10,
      staff: { membershipId: 'staff-ana', fullName: 'Ana Ruiz' },
    },
    openSlots: [{ startsAt: '2026-10-12T15:00:00.000Z', endsAt: '2026-10-12T16:00:00.000Z' }],
    groupSessions: [GROUP],
  };

  it('shows each room with its teacher and lets the center pick an hour', () => {
    const form = buildForm({ mode: 'group', groupRoomOptions: [ENTRY] });
    renderScreen(<GroupRoomOptionsList form={form} />);

    expect(screen.getByText('Sala de baile · con Ana Ruiz')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: /17:00/ }));

    expect(form.selectGroupSlot).toHaveBeenCalledWith({
      staffMembershipId: 'staff-ana',
      roomId: 'room-1',
      startsAt: '2026-10-12T15:00:00.000Z',
    });
  });

  it('lets the center join a group that still has seats', () => {
    const form = buildForm({ mode: 'group', groupRoomOptions: [ENTRY] });
    renderScreen(<GroupRoomOptionsList form={form} />);

    expect(screen.getByText('7 de 10 plazas ocupadas · Salsa')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('radio', { name: /18:00/ }));

    expect(form.selectJoinSession).toHaveBeenCalledWith('session-1');
  });

  it('says so when no room gives the service', () => {
    renderScreen(
      <GroupRoomOptionsList form={buildForm({ mode: 'group', groupRoomOptions: [] })} />,
    );

    expect(screen.getByText(/Ninguna sala da este servicio/)).toBeOnTheScreen();
  });
});
