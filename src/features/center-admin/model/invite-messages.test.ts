import {
  buildInvitationLink,
  buildInviteMessage,
  buildSmsShareUrl,
  buildWhatsAppShareUrl,
} from './invite-messages';

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

describe('invitation sharing', () => {
  it('opens the chat of a phone number in WhatsApp without the plus sign', () => {
    expect(buildWhatsAppShareUrl('Hola', '+34600111222')).toBe(
      'https://wa.me/34600111222?text=Hola',
    );
  });

  it('opens the messages app with the text for SMS', () => {
    expect(buildSmsShareUrl('+34600111222', 'Hola mundo')).toBe(
      'sms:+34600111222?body=Hola%20mundo',
    );
  });

  it('builds the link that opens the app with the code', () => {
    expect(buildInvitationLink('ABCD-EFGH-JKLM')).toBe('https://yoclick.app/i/ABCD-EFGH-JKLM');
  });
});

describe('buildWhatsAppShareUrl', () => {
  it('encodes the message so accents, spaces and links survive', () => {
    expect(buildWhatsAppShareUrl('Únete: https://yoclick.app/j/A B')).toBe(
      'https://wa.me/?text=%C3%9Anete%3A%20https%3A%2F%2Fyoclick.app%2Fj%2FA%20B',
    );
  });
});
