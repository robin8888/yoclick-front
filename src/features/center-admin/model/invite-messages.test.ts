import { buildInviteMessage, buildWhatsAppShareUrl } from './invite-messages';

describe('buildInviteMessage', () => {
  it('names the center and carries the code and the link', () => {
    const message = buildInviteMessage({
      centerName: 'Studio Norte',
      joinCode: 'NORTE7',
      joinLink: 'https://yoclick.app/j/NORTE7',
    });

    expect(message).toContain('Studio Norte');
    expect(message).toContain('NORTE7');
    expect(message).toContain('https://yoclick.app/j/NORTE7');
  });
});

describe('buildWhatsAppShareUrl', () => {
  it('encodes the message so accents, spaces and links survive', () => {
    expect(buildWhatsAppShareUrl('Únete: https://yoclick.app/j/A B')).toBe(
      'https://wa.me/?text=%C3%9Anete%3A%20https%3A%2F%2Fyoclick.app%2Fj%2FA%20B',
    );
  });
});
