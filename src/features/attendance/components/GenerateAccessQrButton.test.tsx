import { act, fireEvent, screen } from '@testing-library/react-native';

import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { GenerateAccessQrButton } from './GenerateAccessQrButton';

const MILLISECONDS_PER_MINUTE = 60_000;
const ONE_HOUR_MS = 60 * MILLISECONDS_PER_MINUTE;
const BUTTON_NAME = 'Generar QR de asistencia';
const TIME_ZONE = 'Europe/Madrid';

function buildAppointmentStartingIn(minutes: number): { startsAt: string; endsAt: string } {
  const startsAtMs = Date.now() + minutes * MILLISECONDS_PER_MINUTE;
  return {
    startsAt: new Date(startsAtMs).toISOString(),
    endsAt: new Date(startsAtMs + ONE_HOUR_MS).toISOString(),
  };
}

describe('GenerateAccessQrButton', () => {
  beforeEach(() => {
    resetMockRouter();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the button disabled and says when it turns on while the appointment is far', () => {
    renderScreen(
      <GenerateAccessQrButton
        nextAppointment={buildAppointmentStartingIn(120)}
        timeZone={TIME_ZONE}
      />,
    );

    expect(screen.getByRole('button', { name: BUTTON_NAME })).toBeDisabled();
    expect(
      screen.getByText(/Se activa a las \d{2}:\d{2}, 15 minutos antes de tu cita\./),
    ).toBeOnTheScreen();
  });

  it('shows the button disabled and explains the rule when there is no appointment', () => {
    renderScreen(<GenerateAccessQrButton nextAppointment={undefined} timeZone={TIME_ZONE} />);

    expect(screen.getByRole('button', { name: BUTTON_NAME })).toBeDisabled();
    expect(screen.getByText('Se activa 15 minutos antes de tu próxima cita.')).toBeOnTheScreen();
  });

  it('enables the button 15 minutes before the appointment and opens the QR', () => {
    renderScreen(
      <GenerateAccessQrButton
        nextAppointment={buildAppointmentStartingIn(10)}
        timeZone={TIME_ZONE}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: BUTTON_NAME }));

    expect(screen.getByRole('button', { name: BUTTON_NAME })).toBeEnabled();
    expect(getMockRouter().push).toHaveBeenCalledWith('/(client)/access-qr');
  });

  it('turns on by itself when the window opens, without leaving the screen', () => {
    jest.useFakeTimers();
    renderScreen(
      <GenerateAccessQrButton
        nextAppointment={buildAppointmentStartingIn(20)}
        timeZone={TIME_ZONE}
      />,
    );
    expect(screen.getByRole('button', { name: BUTTON_NAME })).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(6 * MILLISECONDS_PER_MINUTE);
    });

    expect(screen.getByRole('button', { name: BUTTON_NAME })).toBeEnabled();
  });
});
