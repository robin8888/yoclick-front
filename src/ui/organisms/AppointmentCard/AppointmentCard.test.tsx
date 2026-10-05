import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { AppointmentCard } from './AppointmentCard';

const BASE_PROPS = {
  serviceName: 'Entrenamiento personal',
  whenLabel: 'jue 8 oct · 18:00',
  staffLabel: 'Con Álex Moreno',
  statusLabel: 'Confirmada',
  statusTone: 'success',
} as const;

describe('AppointmentCard', () => {
  it('shows the service, when, who and the status as a word', () => {
    renderInTheme(<AppointmentCard {...BASE_PROPS} />);

    expect(screen.getByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.getByText('jue 8 oct · 18:00')).toBeOnTheScreen();
    expect(screen.getByText('Con Álex Moreno')).toBeOnTheScreen();
    expect(screen.getByText('Confirmada')).toBeOnTheScreen();
  });

  it('has no action button when it is read-only', () => {
    renderInTheme(<AppointmentCard {...BASE_PROPS} />);

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('offers its action and reports the tap', () => {
    const onActionPress = jest.fn();
    renderInTheme(
      <AppointmentCard {...BASE_PROPS} actionLabel="Cancelar cita" onActionPress={onActionPress} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Cancelar cita' }));

    expect(onActionPress).toHaveBeenCalledTimes(1);
  });
});
