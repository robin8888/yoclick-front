import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { BlockedPeopleScreen } from './BlockedPeopleScreen';
import { ConversationScreen } from './ConversationScreen';
import { ConversationsScreen } from './ConversationsScreen';
import { MessageReportsScreen } from './MessageReportsScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CONVERSATION_ID = '0198f4a0-0000-7000-8000-000000000010';
const TEACHER_ID = '0198f4a0-0000-7000-8000-000000000011';
const MESSAGE_ID = '0198f4a0-0000-7000-8000-000000000020';
const CENTER_PATH = `/v1/centers/${NORTE_CENTER_ID}`;
const BASE = `${CENTER_PATH}/conversations`;
const MESSAGE_PATH = `${BASE}/${CONVERSATION_ID}/messages`;

const TEACHER = {
  kind: 'person',
  membershipId: TEACHER_ID,
  fullName: 'Marta Ruiz',
  role: 'staff',
  photoUrl: null,
} as const;

const OTHER_SIDE_MESSAGE = {
  id: MESSAGE_ID,
  conversationId: CONVERSATION_ID,
  senderMembershipId: TEACHER_ID,
  senderName: 'Marta Ruiz',
  isMine: false,
  body: 'Mañana traed el kimono',
  attachment: null,
  createdAt: '2026-10-15T10:00:00.000Z',
};

const OWN_MESSAGE = {
  ...OTHER_SIDE_MESSAGE,
  id: '0198f4a0-0000-7000-8000-000000000021',
  isMine: true,
  senderName: 'Ana',
  body: 'Vale, gracias',
};

const CONVERSATION_LIST = {
  unreadTotal: 0,
  conversations: [
    {
      id: CONVERSATION_ID,
      counterpart: TEACHER,
      lastMessage: OTHER_SIDE_MESSAGE,
      lastMessageAt: '2026-10-15T10:00:00.000Z',
      unreadCount: 0,
    },
  ],
};

function membershipsAs(role: 'client' | 'staff' | 'admin'): Record<string, unknown> {
  return {
    memberships: [
      {
        membershipId: 'm1',
        centerId: NORTE_CENTER_ID,
        role,
        center: { name: 'Gimnasio Norte', sectorId: 'gym' },
      },
    ],
  };
}

function mockThread(role: 'client' | 'staff' | 'admin', extra: Record<string, unknown> = {}): void {
  mockApi({
    'GET /v1/me/memberships': membershipsAs(role),
    [`GET ${BASE}`]: CONVERSATION_LIST,
    [`GET ${MESSAGE_PATH}`]: { messages: [OTHER_SIDE_MESSAGE, OWN_MESSAGE] },
    [`POST ${BASE}/${CONVERSATION_ID}/read`]: undefined,
    ...extra,
  });
}

describe('chat safety (Apple 1.2)', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('offers to report the other side messages but not my own', async () => {
    mockThread('client');
    renderScreen(<ConversationScreen conversationId={CONVERSATION_ID} />);

    expect(await screen.findByText('Mañana traed el kimono')).toBeOnTheScreen();

    expect(screen.getAllByRole('button', { name: /Denunciar el mensaje de/ })).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Denunciar el mensaje de Marta Ruiz' }),
    ).toBeOnTheScreen();
  });

  it('reports a message with the reason and the details, and confirms it was sent', async () => {
    mockThread('client', {
      [`POST ${MESSAGE_PATH}/${MESSAGE_ID}/report`]: { reportId: 'r1', status: 'open' },
    });
    renderScreen(<ConversationScreen conversationId={CONVERSATION_ID} />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Denunciar el mensaje de Marta Ruiz' }),
    );
    const send = await screen.findByRole('button', { name: 'Enviar denuncia' });
    expect(send).toBeDisabled();
    fireEvent.press(screen.getByRole('radio', { name: /Es acoso o me molesta/ }));
    fireEvent.changeText(screen.getByLabelText('Detalles (opcional)'), 'Me escribe de madrugada');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar denuncia' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${MESSAGE_PATH}/${MESSAGE_ID}/report`)?.body).toEqual({
        reason: 'harassment',
        details: 'Me escribe de madrugada',
      });
    });
    expect(await screen.findByText(/Hemos enviado tu denuncia/)).toBeOnTheScreen();
  });

  it('does not send the details when none were written', async () => {
    mockThread('client', {
      [`POST ${MESSAGE_PATH}/${MESSAGE_ID}/report`]: { reportId: 'r1', status: 'open' },
    });
    renderScreen(<ConversationScreen conversationId={CONVERSATION_ID} />);

    fireEvent.press(
      await screen.findByRole('button', { name: 'Denunciar el mensaje de Marta Ruiz' }),
    );
    fireEvent.press(await screen.findByRole('radio', { name: /Es spam o publicidad/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Enviar denuncia' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${MESSAGE_PATH}/${MESSAGE_ID}/report`)?.body).toEqual({
        reason: 'spam',
      });
    });
  });

  it('lets a student block the teacher after confirming, and asks the API to do it', async () => {
    mockThread('client', {
      [`POST ${CENTER_PATH}/chat-blocks`]: {
        membershipId: TEACHER_ID,
        fullName: 'Marta Ruiz',
        role: 'staff',
        photoUrl: null,
        blockedAt: '2026-10-28T10:00:00.000Z',
      },
    });
    renderScreen(<ConversationScreen conversationId={CONVERSATION_ID} />);

    fireEvent.press(await screen.findByRole('button', { name: 'Más opciones de la conversación' }));
    expect(await screen.findByText('¿Bloquear a Marta Ruiz?')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Bloquear' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${CENTER_PATH}/chat-blocks`)?.body).toEqual({
        blockedMembershipId: TEACHER_ID,
      });
    });
  });

  it('does not offer blocking to the center administration', async () => {
    mockThread('admin');
    renderScreen(<ConversationScreen conversationId={CONVERSATION_ID} />);

    expect(await screen.findByText('Mañana traed el kimono')).toBeOnTheScreen();

    expect(screen.queryByRole('button', { name: 'Más opciones de la conversación' })).toBeNull();
  });

  it('shows the way to the blocked people from the inbox when one is given', async () => {
    mockApi({ [`GET ${BASE}`]: CONVERSATION_LIST });
    const onPress = jest.fn();
    renderScreen(
      <ConversationsScreen
        onConversationOpen={jest.fn()}
        onNewConversationPress={jest.fn()}
        safetyLink={{ label: 'Personas bloqueadas', onPress }}
      />,
    );

    fireEvent.press(await screen.findByRole('button', { name: 'Personas bloqueadas' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('lists the blocked people and unblocks one', async () => {
    mockApi({
      [`GET ${CENTER_PATH}/chat-blocks`]: {
        blocks: [
          {
            membershipId: TEACHER_ID,
            fullName: 'Marta Ruiz',
            role: 'staff',
            photoUrl: null,
            blockedAt: '2026-10-28T10:00:00.000Z',
          },
        ],
      },
      [`DELETE ${CENTER_PATH}/chat-blocks/${TEACHER_ID}`]: undefined,
    });
    renderScreen(<BlockedPeopleScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Desbloquear a Marta Ruiz' }));

    await waitFor(() => {
      expect(findApiCall('DELETE', `${CENTER_PATH}/chat-blocks/${TEACHER_ID}`)).toBeDefined();
    });
  });

  it('says nobody is blocked when the list is empty', async () => {
    mockApi({ [`GET ${CENTER_PATH}/chat-blocks`]: { blocks: [] } });
    renderScreen(<BlockedPeopleScreen />);

    expect(await screen.findByText('No has bloqueado a nadie')).toBeOnTheScreen();
  });

  it('shows the center the reported message and marks the report as reviewed', async () => {
    mockApi({
      [`GET ${CENTER_PATH}/message-reports`]: {
        reports: [
          {
            id: 'report-1',
            reason: 'harassment',
            details: 'Insiste cada noche',
            status: 'open',
            reporterName: 'Ana Pérez',
            reportedSenderName: 'Luis Gil',
            reportedBody: 'Contéstame ya',
            reportedAttachmentName: null,
            createdAt: '2026-10-28T09:00:00.000Z',
            reviewedAt: null,
          },
        ],
      },
      [`POST ${CENTER_PATH}/message-reports/report-1/review`]: {
        id: 'report-1',
        status: 'reviewed',
      },
    });
    renderScreen(<MessageReportsScreen />);

    expect(await screen.findByText('Contéstame ya')).toBeOnTheScreen();
    expect(screen.getByText('Mensaje de Luis Gil')).toBeOnTheScreen();
    expect(screen.getByText('Es acoso o me molesta')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Marcar como revisada' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${CENTER_PATH}/message-reports/report-1/review`)).toBeDefined();
    });
  });

  it('says there are no open reports', async () => {
    mockApi({ [`GET ${CENTER_PATH}/message-reports`]: { reports: [] } });
    renderScreen(<MessageReportsScreen />);

    expect(await screen.findByText('No hay denuncias abiertas')).toBeOnTheScreen();
  });
});
