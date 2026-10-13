import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { ProblemModal } from './ProblemModal';

function renderModal(hasProblem: boolean, onDismiss = jest.fn()): jest.Mock {
  renderInTheme(
    <ProblemModal
      title="No se ha podido guardar"
      message={hasProblem ? 'Esa persona ya da otra clase a esa hora.' : null}
      dismissLabel="Entendido"
      onDismiss={onDismiss}
    />,
  );
  return onDismiss;
}

describe('ProblemModal', () => {
  it('says what went wrong and closes with «Entendido»', () => {
    const onDismiss = renderModal(true);

    expect(screen.getByText('No se ha podido guardar')).toBeOnTheScreen();
    expect(screen.getByText('Esa persona ya da otra clase a esa hora.')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Entendido' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows nothing while there is no problem', () => {
    renderModal(false);

    expect(screen.queryByText('No se ha podido guardar')).not.toBeOnTheScreen();
  });
});
