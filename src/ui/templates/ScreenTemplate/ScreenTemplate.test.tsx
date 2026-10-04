import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { ScreenTemplate } from './ScreenTemplate';

describe('ScreenTemplate', () => {
  it('renders the title as a heading with subtitle, content and footer', () => {
    renderInTheme(
      <ScreenTemplate
        title="Código del centro"
        subtitle="Te lo da tu centro"
        footer={<Text>Pie</Text>}
      >
        <Text>Contenido</Text>
      </ScreenTemplate>,
    );

    expect(screen.getByRole('heading', { name: 'Código del centro' })).toBeOnTheScreen();
    expect(screen.getByText('Te lo da tu centro')).toBeOnTheScreen();
    expect(screen.getByText('Contenido')).toBeOnTheScreen();
    expect(screen.getByText('Pie')).toBeOnTheScreen();
  });

  it('shows a back button only when a handler is given', () => {
    const handleBackPress = jest.fn();
    renderInTheme(
      <ScreenTemplate title="Buscar centro" onBackPress={handleBackPress} backLabel="Volver">
        <Text>Contenido</Text>
      </ScreenTemplate>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Volver' }));

    expect(handleBackPress).toHaveBeenCalledTimes(1);
  });

  it('has no back button by default', () => {
    renderInTheme(
      <ScreenTemplate title="Encuentra tu centro">
        <Text>Contenido</Text>
      </ScreenTemplate>,
    );

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
