import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useState } from 'react';

import type { MapPoint } from '@/shared/lib/location-link';
import { renderInTheme } from '@/test/render-in-theme';

import { ExactPointField } from './ExactPointField';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));

const RETIRO = { latitude: 40.4153, longitude: -3.6844 };

function Harness(): React.JSX.Element {
  const [point, setPoint] = useState<MapPoint | null>(null);
  return <ExactPointField point={point} onPointChange={setPoint} />;
}

function allowLocation(): void {
  jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
    granted: true,
  } as Location.LocationPermissionResponse);
  jest.mocked(Location.getCurrentPositionAsync).mockResolvedValue({
    coords: RETIRO,
  } as Location.LocationObject);
}

describe('ExactPointField', () => {
  it('saves the point where the phone is when the person asks for it', async () => {
    allowLocation();
    renderInTheme(<Harness />);

    fireEvent.press(screen.getByRole('button', { name: 'Usar mi ubicación actual' }));

    expect(await screen.findByText('Punto exacto guardado: 40.41530, -3.68440')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Quitar el punto exacto' })).toBeOnTheScreen();
  });

  it('explains what to do when the permission is denied, without saving anything', async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      granted: false,
    } as Location.LocationPermissionResponse);
    renderInTheme(<Harness />);

    fireEvent.press(screen.getByRole('button', { name: 'Usar mi ubicación actual' }));

    expect(await screen.findByText(/No tenemos permiso para ver tu ubicación/)).toBeOnTheScreen();
    expect(screen.queryByText(/Punto exacto guardado/)).not.toBeOnTheScreen();
  });

  it('says it could not find the phone instead of failing silently', async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockRejectedValue(new Error('off'));
    renderInTheme(<Harness />);

    fireEvent.press(screen.getByRole('button', { name: 'Usar mi ubicación actual' }));

    expect(await screen.findByText(/No hemos podido saber dónde estás/)).toBeOnTheScreen();
  });

  it('reads the point of a location link pasted from WhatsApp or Google Maps', async () => {
    renderInTheme(<Harness />);

    fireEvent.changeText(
      screen.getByLabelText('O pega un enlace de ubicación'),
      'https://maps.google.com/?q=40.4153,-3.6844',
    );

    expect(await screen.findByText('Punto exacto guardado: 40.41530, -3.68440')).toBeOnTheScreen();
  });

  it('warns when the pasted text has no point, such as a short Google link', () => {
    renderInTheme(<Harness />);

    fireEvent.changeText(
      screen.getByLabelText('O pega un enlace de ubicación'),
      'https://maps.app.goo.gl/AbCdEf123',
    );

    expect(screen.getByText(/No encontramos un punto en ese enlace/)).toBeOnTheScreen();
  });

  it('removes the point that was saved', async () => {
    allowLocation();
    renderInTheme(<Harness />);
    fireEvent.press(screen.getByRole('button', { name: 'Usar mi ubicación actual' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Quitar el punto exacto' }));

    await waitFor(() => {
      expect(screen.queryByText(/Punto exacto guardado/)).not.toBeOnTheScreen();
    });
  });
});
