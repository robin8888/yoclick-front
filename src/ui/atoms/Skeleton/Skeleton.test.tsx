import { screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { buildTheme, colorTokens } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { Skeleton } from './Skeleton';
import { createSkeletonStyle } from './Skeleton.styles';

describe('Skeleton', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is hidden from screen readers because it is decorative', () => {
    renderInTheme(<Skeleton height={20} />);

    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();
    expect(screen.queryByText(/./)).not.toBeOnTheScreen();
    expect(JSON.stringify(screen.toJSON())).toContain('no-hide-descendants');
  });

  it('draws a surface2 block with the requested size', () => {
    renderInTheme(<Skeleton width={120} height={16} />);

    expect(JSON.stringify(screen.toJSON())).toContain(colorTokens.light.surface2);
    expect(JSON.stringify(screen.toJSON())).toContain('"width":120');
  });

  it('stays still when the user asked for reduced motion', async () => {
    const reduceMotionQuery = jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);

    renderInTheme(<Skeleton height={20} />);
    await waitFor(() => {
      expect(reduceMotionQuery).toHaveBeenCalled();
    });

    expect(JSON.stringify(screen.toJSON())).toContain('"opacity":1');
  });
});

describe('createSkeletonStyle', () => {
  const theme = buildTheme({ mode: 'light' });

  it('uses the full width by default and the small radius', () => {
    expect(createSkeletonStyle({ theme, height: 12 })).toMatchObject({
      width: '100%',
      height: 12,
      borderRadius: theme.radius.sm,
    });
  });

  it('makes circles as wide as they are tall with a pill radius', () => {
    expect(createSkeletonStyle({ theme, height: 40, width: 200, shape: 'circle' })).toMatchObject({
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
    });
  });
});
