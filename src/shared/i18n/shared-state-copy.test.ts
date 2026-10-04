import { formatSupportCode, getSharedStateCopy } from './shared-state-copy';

describe('getSharedStateCopy', () => {
  it('has a non-empty es-ES text for every shared state', () => {
    const copyTexts: Record<string, string> = { ...getSharedStateCopy() };
    Object.values(copyTexts).forEach((text) => {
      expect(text.trim()).not.toBe('');
      expect(text).not.toMatch(/^states\./);
    });
  });

  it('never blames the user and talks to them with tuteo', () => {
    const { errorTitle, forceUpdateMessage } = getSharedStateCopy();

    expect(errorTitle).not.toMatch(/\b(has |tu error|culpa)/i);
    expect(forceUpdateMessage).toContain('Tus datos');
  });

  it('shows the support code without leaking anything else', () => {
    expect(formatSupportCode('503-A7F2')).toBe('Código de error: 503-A7F2 (para soporte)');
  });
});
