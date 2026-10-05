import { screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { SessionTimerDisplay } from './SessionTimerDisplay';

const BASE_PROPS = {
  mainTimeLabel: '12:07',
  mainTimeCaption: 'Restante',
  detailLabel: 'Transcurrido 47:53 de 60:00',
  progressFraction: 0.8,
} as const;

describe('SessionTimerDisplay', () => {
  it('is one timer for the screen reader that says what the big time means', () => {
    renderInTheme(<SessionTimerDisplay {...BASE_PROPS} isOvertime={false} />);

    expect(
      screen.getByRole('timer', { name: 'Restante 12:07. Transcurrido 47:53 de 60:00' }),
    ).toBeOnTheScreen();
  });

  it('says overtime with a word, not only with a color', () => {
    renderInTheme(
      <SessionTimerDisplay {...BASE_PROPS} mainTimeCaption="Tiempo extra" isOvertime />,
    );

    expect(screen.getByRole('timer', { name: /Tiempo extra/ })).toBeOnTheScreen();
  });
});
