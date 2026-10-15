import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { NotificationListResponseDtoNotificationsItem } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { NotificationsScreen } from './NotificationsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const NOTIFICATION_ID = '0a1b2c3d-0000-4000-8000-000000000001';
const LIST_PATH = `GET /v1/centers/${NORTE_CENTER_ID}/notifications`;
const DELETE_ONE_PATH = `DELETE /v1/centers/${NORTE_CENTER_ID}/notifications/${NOTIFICATION_ID}`;
const DELETE_ALL_PATH = `DELETE /v1/centers/${NORTE_CENTER_ID}/notifications`;

function buildNotification(): NotificationListResponseDtoNotificationsItem {
  return {
    id: NOTIFICATION_ID,
    kind: 'booking_created',
    data: {
      clientName: 'Ana Pérez',
      serviceName: 'Sesión personal',
      startsAt: '2026-10-08T16:00:00.000Z',
    },
    bookingId: null,
    isRead: true,
    createdAt: '2026-10-07T10:00:00.000Z',
  };
}

describe('NotificationsScreen', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('removes one notice from the list when its bin is pressed', async () => {
    mockApi({
      [LIST_PATH]: { notifications: [buildNotification()], unreadCount: 0 },
      [DELETE_ONE_PATH]: undefined,
    });
    renderScreen(<NotificationsScreen audience="admin" />);

    fireEvent.press(await screen.findByRole('button', { name: 'Borrar aviso: Nueva reserva' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', DELETE_ONE_PATH.replace('DELETE ', ''))).toBeDefined();
    });
  });

  it('asks before deleting every notice and then deletes them on the server', async () => {
    mockApi({
      [LIST_PATH]: { notifications: [buildNotification()], unreadCount: 0 },
      [DELETE_ALL_PATH]: undefined,
    });
    renderScreen(<NotificationsScreen audience="admin" />);

    fireEvent.press(await screen.findByRole('button', { name: 'Borrar todos' }));
    expect(await screen.findByText('¿Borrar todos los avisos?')).toBeOnTheScreen();
    expect(findApiCall('DELETE', DELETE_ALL_PATH.replace('DELETE ', ''))).toBeUndefined();
    fireEvent.press(screen.getByRole('button', { name: 'Sí, borrar todos' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', DELETE_ALL_PATH.replace('DELETE ', ''))).toBeDefined();
    });
  });
  it('takes the person to the screen the notice is about', async () => {
    mockApi({ [LIST_PATH]: { notifications: [buildNotification()], unreadCount: 0 } });
    renderScreen(<NotificationsScreen audience="admin" />);

    fireEvent.press(await screen.findByText('Nueva reserva'));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/day-agenda');
  });
});
