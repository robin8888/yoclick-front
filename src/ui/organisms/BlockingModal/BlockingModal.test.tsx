import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { BlockingModal } from './BlockingModal';

function renderModal(isVisible: boolean, onActionPress = jest.fn()): jest.Mock {
  renderInTheme(
    <BlockingModal
      isVisible={isVisible}
      title="Tu prueba gratuita ha terminado"
      message="Elige un plan para seguir."
      actionLabel="Elegir un plan"
      onActionPress={onActionPress}
    />,
  );
  return onActionPress;
}

describe('BlockingModal', () => {
  it('says why the app is blocked and offers the single way out', () => {
    const onActionPress = renderModal(true);

    expect(screen.getByText('Tu prueba gratuita ha terminado')).toBeOnTheScreen();
    expect(screen.getByText('Elige un plan para seguir.')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Elegir un plan' }));

    expect(onActionPress).toHaveBeenCalledTimes(1);
  });

  it('shows nothing when it is not visible', () => {
    renderModal(false);

    expect(screen.queryByText('Tu prueba gratuita ha terminado')).not.toBeOnTheScreen();
  });
});
