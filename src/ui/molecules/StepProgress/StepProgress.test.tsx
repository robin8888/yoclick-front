import { screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { StepProgress } from './StepProgress';

describe('StepProgress', () => {
  it('tells the current step and how many there are', () => {
    renderInTheme(<StepProgress currentStep={1} stepCount={3} accessibilityLabel="Paso 1 de 3" />);

    const progress = screen.getByRole('progressbar', { name: 'Paso 1 de 3' });

    expect(progress).toBeOnTheScreen();
    expect(progress.props['aria-valuenow']).toBe(1);
    expect(progress.props['aria-valuemax']).toBe(3);
  });
});
