import type { ConversationListResponseDtoConversationsItem } from '@/shared/api/generated/model';

import {
  describeCounterpartName,
  describeLastMessage,
  describeUnreadCount,
} from './conversation-text';

type LastMessage = NonNullable<ConversationListResponseDtoConversationsItem['lastMessage']>;

function buildMessage(overrides: Partial<LastMessage>): LastMessage {
  return {
    id: '0198f4a0-0000-7000-8000-000000000001',
    conversationId: '0198f4a0-0000-7000-8000-000000000002',
    senderMembershipId: '0198f4a0-0000-7000-8000-000000000003',
    senderName: 'Ana',
    isMine: false,
    body: 'Hola',
    attachment: null,
    createdAt: '2026-10-15T10:00:00.000Z',
    ...overrides,
  };
}

describe('describeLastMessage', () => {
  it('is empty without messages', () => {
    expect(describeLastMessage(null)).toBe('');
  });

  it('shows the text of a message from the other side', () => {
    expect(describeLastMessage(buildMessage({}))).toBe('Hola');
  });

  it('prefixes my own messages', () => {
    expect(describeLastMessage(buildMessage({ isMine: true }))).toBe('Tú: Hola');
  });

  it.each([
    ['image', 'Foto'],
    ['pdf', 'Documento'],
  ] as const)('names a %s attachment', (kind, expected) => {
    const attachment = { kind, name: 'archivo', sizeBytes: 10, url: 'https://x.test/a' };
    expect(describeLastMessage(buildMessage({ body: null, attachment }))).toBe(expected);
  });
});

describe('describeCounterpartName', () => {
  it('uses the center name for the center and the person name otherwise', () => {
    expect(describeCounterpartName({ kind: 'center' }, 'Dojo Kai')).toBe('Dojo Kai');
    expect(
      describeCounterpartName(
        {
          kind: 'person',
          membershipId: '0198f4a0-0000-7000-8000-000000000004',
          fullName: 'Marta',
          role: 'staff',
          photoUrl: null,
        },
        'Dojo Kai',
      ),
    ).toBe('Marta');
  });
});

describe('describeUnreadCount', () => {
  it.each([
    [0, ''],
    [1, '1 mensaje sin leer'],
    [3, '3 mensajes sin leer'],
  ])('%i → "%s"', (count, expected) => {
    expect(describeUnreadCount(count)).toBe(expected);
  });
});
