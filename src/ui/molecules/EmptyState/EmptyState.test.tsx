import { fireEvent, screen } from '@testing-library/react-native';

import { MIN_TOUCH_TARGET_SIZE } from '@/shared/theme';
import { renderInTheme } from '@/test/render-in-theme';

import { EmptyState } from './EmptyState';

function renderAppointmentsEmptyState(handleActionPress = jest.fn()): void {
  renderInTheme(
    <EmptyState
      iconName="calendar"
      title="Aún no tienes citas"
      description="Reserva tu primera sesión y aparecerá aquí."
      actionLabel="Reservar cita"
      onActionPress={handleActionPress}
    />,
  );
}

describe('EmptyState', () => {
  it('explains what is empty with a heading and a description', () => {
    renderAppointmentsEmptyState();

    expect(screen.getByRole('heading', { name: 'Aún no tienes citas' })).toBeOnTheScreen();
    expect(screen.getByText('Reserva tu primera sesión y aparecerá aquí.')).toBeOnTheScreen();
  });

  it('always offers the next action', () => {
    const handleActionPress = jest.fn();
    renderAppointmentsEmptyState(handleActionPress);

    fireEvent.press(screen.getByRole('button', { name: 'Reservar cita' }));

    expect(handleActionPress).toHaveBeenCalledTimes(1);
  });

  it('keeps the action at least 44 px tall', () => {
    renderAppointmentsEmptyState();

    expect(screen.getByRole('button', { name: 'Reservar cita' })).toHaveStyle({
      minHeight: MIN_TOUCH_TARGET_SIZE,
    });
  });

  it('works without a description', () => {
    renderInTheme(
      <EmptyState
        iconName="users"
        title="Todavía no hay clientes"
        actionLabel="Invitar clientes"
        onActionPress={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Todavía no hay clientes' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Invitar clientes' })).toBeOnTheScreen();
  });

  it('does not allow an empty state without an action at compile time', () => {
    renderInTheme(
      // @ts-expect-error el vacío sin siguiente acción no compila
      <EmptyState iconName="calendar" title="Sin citas" />,
    );

    expect(screen.getByText('Sin citas')).toBeOnTheScreen();
  });
});
