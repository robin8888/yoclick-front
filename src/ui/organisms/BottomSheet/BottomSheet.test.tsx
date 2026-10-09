import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('shows its title and content when visible', () => {
    renderInTheme(
      <BottomSheet isVisible title="Asignar contenido" onDismiss={jest.fn()}>
        <Text>Por nivel</Text>
      </BottomSheet>,
    );

    expect(screen.getByRole('heading', { name: 'Asignar contenido' })).toBeOnTheScreen();
    expect(screen.getByText('Por nivel')).toBeOnTheScreen();
  });

  it('renders nothing while hidden', () => {
    renderInTheme(
      <BottomSheet isVisible={false} title="Asignar contenido" onDismiss={jest.fn()}>
        <Text>Por nivel</Text>
      </BottomSheet>,
    );

    expect(screen.queryByText('Por nivel')).not.toBeOnTheScreen();
  });
});
