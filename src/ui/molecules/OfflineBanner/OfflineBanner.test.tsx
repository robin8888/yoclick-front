import { screen } from '@testing-library/react-native';

import { calculateContrastRatio, colorTokens, MIN_TOUCH_TARGET_SIZE } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { OfflineBanner } from './OfflineBanner';

const OFFLINE_MESSAGE = 'Sin conexión · mostrando lo guardado a las 9:38';

describe('OfflineBanner', () => {
  it('renders nothing while online', () => {
    renderInTheme(<OfflineBanner isOffline={false} message={OFFLINE_MESSAGE} />);

    expect(screen.queryByText(OFFLINE_MESSAGE)).not.toBeOnTheScreen();
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('announces the loss of connection politely when offline', () => {
    renderInTheme(<OfflineBanner isOffline message={OFFLINE_MESSAGE} />);

    expect(screen.getByRole('alert', { name: OFFLINE_MESSAGE })).toBeOnTheScreen();
    expect(screen.getByRole('alert', { name: OFFLINE_MESSAGE }).props).toMatchObject({
      accessibilityLiveRegion: 'polite',
    });
  });

  it('is a fixed ink strip with surface text, tall enough to read comfortably', () => {
    renderInTheme(<OfflineBanner isOffline message={OFFLINE_MESSAGE} />);

    expect(screen.getByRole('alert')).toHaveStyle({
      backgroundColor: colorTokens.light.ink,
      minHeight: MIN_TOUCH_TARGET_SIZE,
    });
    expect(screen.getByText(OFFLINE_MESSAGE)).toHaveStyle({ color: colorTokens.light.surface });
  });

  it.each(['light', 'dark'] as const)(
    'keeps AA contrast between text and strip in %s mode',
    (mode) => {
      const { ink, surface } = colorTokens[mode];

      expect(calculateContrastRatio(surface, ink)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('follows the dark theme', () => {
    renderInTheme(<OfflineBanner isOffline message={OFFLINE_MESSAGE} />, { mode: 'dark' });

    expect(screen.getByRole('alert')).toHaveStyle({ backgroundColor: colorTokens.dark.ink });
  });
});
