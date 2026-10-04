import { fireEvent, screen } from '@testing-library/react-native';

import { colorTokens } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { ErrorState } from './ErrorState';

function renderAgendaErrorState(
  overrides: { isRetrying?: boolean; supportCodeText?: string } = {},
) {
  const handleRetry = jest.fn();
  renderInTheme(
    <ErrorState
      title="No hemos podido cargar tu agenda"
      message="Es un problema nuestro, no de tu móvil."
      retryLabel="Reintentar"
      onRetry={handleRetry}
      {...overrides}
    />,
  );
  return handleRetry;
}

describe('ErrorState', () => {
  it('says what happened without blaming the user', () => {
    renderAgendaErrorState();

    expect(
      screen.getByRole('heading', { name: 'No hemos podido cargar tu agenda' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Es un problema nuestro, no de tu móvil.')).toBeOnTheScreen();
  });

  it('offers a retry action', () => {
    const handleRetry = renderAgendaErrorState();

    fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('marks the retry button as busy and ignores presses while retrying', () => {
    const handleRetry = renderAgendaErrorState({ isRetrying: true });

    fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeBusy();
    expect(handleRetry).not.toHaveBeenCalled();
  });

  it('shows the support code only when there is one', () => {
    renderAgendaErrorState({ supportCodeText: 'Código de error: 503-A7F2 (para soporte)' });

    expect(screen.getByText('Código de error: 503-A7F2 (para soporte)')).toBeOnTheScreen();
  });

  it('has no support code line by default', () => {
    renderAgendaErrorState();

    expect(screen.queryByText(/Código de error/)).not.toBeOnTheScreen();
  });

  it('uses a warning tint and an icon, not the danger color', () => {
    renderAgendaErrorState();

    const renderedTree = JSON.stringify(screen.toJSON());
    expect(renderedTree).toContain(colorTokens.light.warningSoft);
    expect(renderedTree).toContain('lucide-triangle-alert');
  });
});
