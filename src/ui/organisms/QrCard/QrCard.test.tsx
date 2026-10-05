import { screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { QrCard } from './QrCard';

describe('QrCard', () => {
  it('is announced as an image with the given description', () => {
    renderInTheme(
      <QrCard value="otpauth://totp/Yoclick:robin?secret=ABC" accessibilityLabel="QR de prueba" />,
    );

    expect(screen.getByRole('img', { name: 'QR de prueba' })).toBeOnTheScreen();
  });
});
