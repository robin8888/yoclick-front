import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { ConversationScreen } from './ConversationScreen';
import { ConversationsScreen } from './ConversationsScreen';
import { GroupMessageScreen } from './GroupMessageScreen';
import { NewConversationScreen } from './NewConversationScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CONVERSATION_ID = '0198f4a0-0000-7000-8000-000000000010';
const TEACHER_ID = '0198f4a0-0000-7000-8000-000000000011';
const OTHER_PERSON_ID = '0198f4a0-0000-7000-8000-000000000012';
const BASE = `/v1/centers/${NORTE_CENTER_ID}/conversations`;

const TEACHER = {
  kind: 'person',
  membershipId: TEACHER_ID,
  fullName: 'Marta Ruiz',
  role: 'staff',
  photoUrl: null,
} as const;

function buildMessage(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: '0198f4a0-0000-7000-8000-000000000020',
    conversationId: CONVERSATION_ID,
    senderMembershipId: TEACHER_ID,
    senderName: 'Marta Ruiz',
    isMine: false,
    body: 'Mañana traed el kimono',
    attachment: null,
    createdAt: '2026-10-15T10:00:00.000Z',
    ...overrides,
  };
}

const CONVERSATION_LIST = {
  unreadTotal: 2,
  conversations: [
    {
      id: CONVERSATION_ID,
      counterpart: TEACHER,
      lastMessage: buildMessage(),
      lastMessageAt: '2026-10-15T10:00:00.000Z',
      unreadCount: 2,
    },
  ],
};

describe('chat', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('lists the conversations with who wrote, the last message and the unread count', async () => {
    mockApi({ [`GET ${BASE}`]: CONVERSATION_LIST });
    const onConversationOpen = jest.fn();
    renderScreen(
      <ConversationsScreen
        onConversationOpen={onConversationOpen}
        onNewConversationPress={jest.fn()}
      />,
    );

    const row = await screen.findByRole('button', {
      name: 'Marta Ruiz. Mañana traed el kimono. 2 mensajes sin leer',
    });
    fireEvent.press(row);

    expect(onConversationOpen).toHaveBeenCalledWith(CONVERSATION_ID);
  });

  it('invites to write when there are no conversations yet', async () => {
    mockApi({ [`GET ${BASE}`]: { unreadTotal: 0, conversations: [] } });
    const onNewConversationPress = jest.fn();
    renderScreen(
      <ConversationsScreen
        onConversationOpen={jest.fn()}
        onNewConversationPress={onNewConversationPress}
      />,
    );

    expect(await screen.findByText('Aún no tienes mensajes')).toBeOnTheScreen();
    fireEvent.press(screen.getAllByRole('button', { name: 'Nuevo mensaje' })[0] as never);
    expect(onNewConversationPress).toHaveBeenCalled();
  });

  it('opens a conversation with the person chosen and with the center', async () => {
    mockApi({
      [`GET ${BASE}/contacts`]: {
        canWriteToCenter: true,
        people: [
          { membershipId: TEACHER_ID, fullName: 'Marta Ruiz', role: 'staff', photoUrl: null },
        ],
      },
      [`POST ${BASE}`]: { conversationId: CONVERSATION_ID },
    });
    const onConversationOpened = jest.fn();
    renderScreen(<NewConversationScreen onConversationOpened={onConversationOpened} />);

    fireEvent.press(await screen.findByRole('button', { name: /Marta Ruiz/ }));

    await waitFor(() => {
      expect(onConversationOpened).toHaveBeenCalledWith(CONVERSATION_ID);
    });
    expect(findApiCall('POST', BASE)?.body).toEqual({ withMembershipId: TEACHER_ID });
  });

  it('searches people by name, ignoring accents, and picks one to write to', async () => {
    mockApi({
      [`GET ${BASE}/contacts`]: {
        canWriteToCenter: true,
        people: [
          { membershipId: TEACHER_ID, fullName: 'María Pérez', role: 'client', photoUrl: null },
          { membershipId: OTHER_PERSON_ID, fullName: 'Luis Pardo', role: 'client', photoUrl: null },
        ],
      },
      [`POST ${BASE}`]: { conversationId: CONVERSATION_ID },
    });
    const onConversationOpened = jest.fn();
    renderScreen(<NewConversationScreen onConversationOpened={onConversationOpened} />);

    fireEvent.changeText(await screen.findByLabelText('Buscar por nombre'), 'maria');

    expect(screen.queryByText('Luis Pardo')).not.toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: /María Pérez/ }));
    await waitFor(() => {
      expect(findApiCall('POST', BASE)?.body).toEqual({ withMembershipId: TEACHER_ID });
    });
  });

  it('says nobody matches when the search finds no one', async () => {
    mockApi({
      [`GET ${BASE}/contacts`]: {
        canWriteToCenter: false,
        people: [
          { membershipId: TEACHER_ID, fullName: 'María Pérez', role: 'client', photoUrl: null },
        ],
      },
    });
    renderScreen(<NewConversationScreen onConversationOpened={jest.fn()} />);

    fireEvent.changeText(await screen.findByLabelText('Buscar por nombre'), 'zzz');

    expect(screen.getByText('Nadie se llama «zzz».')).toBeOnTheScreen();
  });

  it('shows the thread and sends a message', async () => {
    mockApi({
      [`GET ${BASE}`]: CONVERSATION_LIST,
      [`GET ${BASE}/${CONVERSATION_ID}/messages`]: { messages: [buildMessage()] },
      [`POST ${BASE}/${CONVERSATION_ID}/read`]: undefined,
      [`POST ${BASE}/${CONVERSATION_ID}/messages`]: buildMessage({ isMine: true, body: 'Vale' }),
    });
    renderScreen(<ConversationScreen conversationId={CONVERSATION_ID} />);

    expect(await screen.findByText('Mañana traed el kimono')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Escribe un mensaje'), 'Vale');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/${CONVERSATION_ID}/messages`)?.body).toEqual({
        body: 'Vale',
      });
    });
  });
  it('sends one message to every person of the chosen group', async () => {
    const groupId = '0198f4a0-0000-7000-8000-000000000030';
    mockApi({
      [`GET ${BASE}/broadcast/targets`]: {
        groups: [{ id: groupId, name: 'Grupo mañanas', memberCount: 4 }],
        classes: [],
      },
      [`POST ${BASE}/broadcast`]: { sentCount: 4, skippedMinorCount: 1 },
    });
    renderScreen(<GroupMessageScreen />);

    fireEvent.press(await screen.findByRole('radio', { name: /Grupo mañanas/ }));
    fireEvent.changeText(screen.getByLabelText('Escribe un mensaje'), 'Mañana no hay clase');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(await screen.findByText('Enviado a 4 personas')).toBeOnTheScreen();
    expect(findApiCall('POST', `${BASE}/broadcast`)?.body).toEqual({
      groupId,
      body: 'Mañana no hay clase',
    });
  });
});
