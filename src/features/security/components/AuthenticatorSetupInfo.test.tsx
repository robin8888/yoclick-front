import { act, fireEvent, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { AuthenticatorSetupInfo } from './AuthenticatorSetupInfo';

const SETUP = {
  secret: 'JBSWY3DPEHPK3PXP',
  provisioningUri: 'otpauth://totp/Yoclick:owner?secret=JBSWY3DPEHPK3PXP&issuer=Yoclick',
};
const ONE_MINUTE_MS = 60_000;

describe('AuthenticatorSetupInfo', () => {
  beforeEach(() => {
    jest.mocked(Clipboard.setStringAsync).mockClear();
    jest.mocked(Clipboard.getStringAsync).mockReset().mockResolvedValue('');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the key in groups of four so it is easy to read', () => {
    renderInTheme(<AuthenticatorSetupInfo setup={SETUP} />);

    expect(screen.getByText('JBSW Y3DP EHPK 3PXP')).toBeOnTheScreen();
  });

  it('copies the key without spaces and says so', async () => {
    renderInTheme(<AuthenticatorSetupInfo setup={SETUP} />);

    fireEvent.press(screen.getByRole('button', { name: 'Copiar clave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Clave copiada/);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('JBSWY3DPEHPK3PXP');
  });

  it('clears the clipboard after a minute only if it still holds the key', async () => {
    jest.useFakeTimers();
    jest.mocked(Clipboard.getStringAsync).mockResolvedValue('JBSWY3DPEHPK3PXP');
    renderInTheme(<AuthenticatorSetupInfo setup={SETUP} />);
    fireEvent.press(screen.getByRole('button', { name: 'Copiar clave' }));
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(ONE_MINUTE_MS);
      await Promise.resolve();
    });

    expect(Clipboard.setStringAsync).toHaveBeenLastCalledWith('');
  });

  it('does not touch the clipboard if the person copied something else meanwhile', async () => {
    jest.useFakeTimers();
    jest.mocked(Clipboard.getStringAsync).mockResolvedValue('otra cosa');
    renderInTheme(<AuthenticatorSetupInfo setup={SETUP} />);
    fireEvent.press(screen.getByRole('button', { name: 'Copiar clave' }));
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(ONE_MINUTE_MS);
      await Promise.resolve();
    });

    expect(Clipboard.setStringAsync).not.toHaveBeenCalledWith('');
  });

  it('says there is no authenticator app when the link cannot be opened', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no handler'));
    renderInTheme(<AuthenticatorSetupInfo setup={SETUP} />);

    fireEvent.press(screen.getByRole('button', { name: 'Abrir en mi app de autenticación' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/No hemos encontrado una app/);
  });
});
