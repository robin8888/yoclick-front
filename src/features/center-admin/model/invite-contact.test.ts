import { parseInviteContact } from './invite-contact';

describe('parseInviteContact', () => {
  it.each([
    ['600 111 222', { kind: 'phone', phone: '+34600111222' }],
    ['+34 600-111-222', { kind: 'phone', phone: '+34600111222' }],
    ['0034600111222', { kind: 'phone', phone: '+34600111222' }],
    ['+44 7700 900123', { kind: 'phone', phone: '+447700900123' }],
    ['  Laura@Verticetc.es ', { kind: 'email', email: 'laura@verticetc.es' }],
  ])('reads %p', (raw, expected) => {
    expect(parseInviteContact(raw)).toEqual(expected);
  });

  it.each(['', 'laura', 'laura@', '@x.es', '12345', 'abc def', '600 111'])('rejects %p', (raw) => {
    expect(parseInviteContact(raw)).toBeNull();
  });
});
