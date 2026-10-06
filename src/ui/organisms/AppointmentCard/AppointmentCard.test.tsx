import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { AppointmentCard } from './AppointmentCard';

const BASE_PROPS = {
  dateTile: { weekdayLabel: 'JUE', dayLabel: '1', monthLabel: 'OCT', accessibleLabel: 'jue 1 oct' },
  serviceName: 'Entrenamiento personal',
  detailsLabel: '18:00 · 60 min · Lucía Ferrer',
  statusLabel: 'Confirmada',
  statusTone: 'success',
} as const;

describe('AppointmentCard', () => {
  it('shows the date block, the service, the details and the status as a word', () => {
    renderInTheme(<AppointmentCard {...BASE_PROPS} />);

    expect(screen.getByLabelText('jue 1 oct')).toBeOnTheScreen();
    expect(screen.getByText('JUE')).toBeOnTheScreen();
    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByText('OCT')).toBeOnTheScreen();
    expect(screen.getByText('Entrenamiento personal')).toBeOnTheScreen();
    expect(screen.getByText('18:00 · 60 min · Lucía Ferrer')).toBeOnTheScreen();
    expect(screen.getByText('Confirmada')).toBeOnTheScreen();
  });

  it('has no buttons when it is read-only', () => {
    renderInTheme(<AppointmentCard {...BASE_PROPS} />);

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('offers its buttons and links and reports each tap', () => {
    const onCancelPress = jest.fn();
    const onQrPress = jest.fn();
    renderInTheme(
      <AppointmentCard
        {...BASE_PROPS}
        buttonActions={[{ label: 'Cancelar', variant: 'outline', onPress: onCancelPress }]}
        linkActions={[{ label: 'QR de acceso', iconName: 'qrCode', onPress: onQrPress }]}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.press(screen.getByRole('button', { name: 'QR de acceso' }));

    expect(onCancelPress).toHaveBeenCalledTimes(1);
    expect(onQrPress).toHaveBeenCalledTimes(1);
  });

  it('shows a disabled link as disabled and ignores its taps', () => {
    const onQrPress = jest.fn();
    renderInTheme(
      <AppointmentCard
        {...BASE_PROPS}
        linkActions={[
          { label: 'QR de acceso', iconName: 'qrCode', isDisabled: true, onPress: onQrPress },
        ]}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'QR de acceso' }));

    expect(screen.getByRole('button', { name: 'QR de acceso' })).toBeDisabled();
    expect(onQrPress).not.toHaveBeenCalled();
  });
});
