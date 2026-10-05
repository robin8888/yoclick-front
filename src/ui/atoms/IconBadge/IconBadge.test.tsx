import { screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { IconBadge } from './IconBadge';

describe('IconBadge', () => {
  it('is decorative: the screen title already says what the screen is', () => {
    renderInTheme(<IconBadge iconName="mail" />);

    expect(JSON.stringify(screen.toJSON())).toContain('no-hide-descendants');
  });
});
