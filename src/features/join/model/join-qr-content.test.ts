import { parseJoinQrContent } from './join-qr-content';

describe('parseJoinQrContent', () => {
  it.each([
    ['https://yoclick.app/j/NORTE7', 'NORTE7'],
    ['https://yoclick.app/j/norte7', 'NORTE7'],
    ['  https://yoclick.app/j/FORJA2  ', 'FORJA2'],
    ['https://YOCLICK.APP/j/KINE24', 'KINE24'],
  ])('extracts the join code from %s', (qrContent, expectedJoinCode) => {
    expect(parseJoinQrContent(qrContent)).toBe(expectedJoinCode);
  });

  it.each([
    ['plain text', 'hola'],
    ['a bare code', 'NORTE7'],
    ['another host', 'https://evil.example/j/NORTE7'],
    ['a lookalike host', 'https://yoclick.app.evil.example/j/NORTE7'],
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- caso negativo: http debe rechazarse
    ['http instead of https', 'http://yoclick.app/j/NORTE7'],
    ['the invitation path', 'https://yoclick.app/i/abc123'],
    ['an empty code', 'https://yoclick.app/j/'],
    ['a code with symbols', 'https://yoclick.app/j/NOR-TE7'],
    ['a too short code', 'https://yoclick.app/j/AB'],
    ['extra path segments', 'https://yoclick.app/j/NORTE7/extra'],
    ['credentials', 'https://user:pass@yoclick.app/j/NORTE7'],
    ['a check-in token', 'yoclick:checkin:abc.def.ghi'],
    ['an empty string', ''],
  ])('rejects %s', (_label, qrContent) => {
    expect(parseJoinQrContent(qrContent)).toBeNull();
  });
});
