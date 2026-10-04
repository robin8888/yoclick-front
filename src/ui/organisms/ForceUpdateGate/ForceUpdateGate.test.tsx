import { fireEvent, screen } from '@testing-library/react-native';
import { Text as NativeText } from 'react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { ForceUpdateGate } from './ForceUpdateGate';

function renderGate(isUpdateRequired: boolean, handleUpdatePress = jest.fn()): void {
  renderInTheme(
    <ForceUpdateGate
      isUpdateRequired={isUpdateRequired}
      title="Actualiza la app"
      message="Hay una versión nueva con mejoras de seguridad."
      updateButtonLabel="Actualizar ahora"
      onUpdatePress={handleUpdatePress}
    >
      <NativeText>Contenido de la app</NativeText>
    </ForceUpdateGate>,
  );
}

describe('ForceUpdateGate', () => {
  it('shows the app when no update is required', () => {
    renderGate(false);

    expect(screen.getByText('Contenido de la app')).toBeOnTheScreen();
    expect(screen.queryByText('Actualiza la app')).not.toBeOnTheScreen();
  });

  it('replaces the app with the update screen when an update is required', () => {
    renderGate(true);

    expect(screen.getByRole('heading', { name: 'Actualiza la app' })).toBeOnTheScreen();
    expect(screen.getByText('Hay una versión nueva con mejoras de seguridad.')).toBeOnTheScreen();
    expect(screen.queryByText('Contenido de la app')).not.toBeOnTheScreen();
  });

  it('offers a single way forward: the update button', () => {
    const handleUpdatePress = jest.fn();
    renderGate(true, handleUpdatePress);

    fireEvent.press(screen.getByRole('button', { name: 'Actualizar ahora' }));

    expect(handleUpdatePress).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('is announced as modal so screen readers stay inside it', () => {
    renderGate(true);

    expect(JSON.stringify(screen.toJSON())).toContain('"accessibilityViewIsModal":true');
  });
});
