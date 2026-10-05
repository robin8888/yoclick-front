import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { ConfirmSheet } from './ConfirmSheet';

const BASE_PROPS = {
  title: '¿Cancelar esta cita?',
  message: 'Entrenamiento personal · jue 8 oct · 18:00',
  confirmLabel: 'Sí, cancelar',
  dismissLabel: 'Mantener cita',
} as const;

describe('ConfirmSheet', () => {
  it('shows the question, the detail and both actions when visible', () => {
    renderInTheme(
      <ConfirmSheet {...BASE_PROPS} isVisible onConfirm={jest.fn()} onDismiss={jest.fn()} />,
    );

    expect(screen.getByText('¿Cancelar esta cita?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sí, cancelar' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mantener cita' })).toBeOnTheScreen();
  });

  it('renders nothing while hidden', () => {
    renderInTheme(
      <ConfirmSheet
        {...BASE_PROPS}
        isVisible={false}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.queryByText('¿Cancelar esta cita?')).not.toBeOnTheScreen();
  });

  it('calls the matching callback for each action', () => {
    const onConfirm = jest.fn();
    const onDismiss = jest.fn();
    renderInTheme(
      <ConfirmSheet {...BASE_PROPS} isVisible onConfirm={onConfirm} onDismiss={onDismiss} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Sí, cancelar' }));
    fireEvent.press(screen.getByRole('button', { name: 'Mantener cita' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('cannot be dismissed while the server is answering', () => {
    renderInTheme(
      <ConfirmSheet
        {...BASE_PROPS}
        isVisible
        isConfirming
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Mantener cita' })).toBeDisabled();
  });
});
