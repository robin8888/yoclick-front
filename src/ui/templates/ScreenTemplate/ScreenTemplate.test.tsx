import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { CenterIdentityProvider } from '@/shared/theme';
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

  it('renders the header accessory above the title', () => {
    renderInTheme(
      <ScreenTemplate
        title="Encuentra tu centro"
        headerAccessory={<Text>Logo</Text>}
        isHeaderCentered
      >
        <Text>Contenido</Text>
      </ScreenTemplate>,
    );

    expect(screen.getByText('Logo')).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Encuentra tu centro' })).toHaveStyle({
      textAlign: 'center',
    });
  });

  it('renders with the platform hero background in both modes', () => {
    renderInTheme(
      <ScreenTemplate title="Encuentra tu centro" hasPlatformHeroBackground>
        <Text>Contenido</Text>
      </ScreenTemplate>,
      { mode: 'dark' },
    );

    expect(screen.getByText('Contenido')).toBeOnTheScreen();
  });

  it('shows the center name above the title on screens inside a center', () => {
    renderInTheme(
      <CenterIdentityProvider
        centerIdentity={{
          name: 'Gimnasio Norte',
          logoImageUrl: null,
          personName: 'Lucía Torres',
          roleLabel: 'Alumno',
        }}
      >
        <ScreenTemplate title="Mis citas">
          <Text>Contenido</Text>
        </ScreenTemplate>
      </CenterIdentityProvider>,
    );

    expect(screen.getByText('Gimnasio Norte')).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: 'Mis citas' })).toBeOnTheScreen();
  });

  it('shows no center name outside a center or on platform screens', () => {
    renderInTheme(
      <CenterIdentityProvider
        centerIdentity={{
          name: 'Gimnasio Norte',
          logoImageUrl: null,
          personName: 'Lucía Torres',
          roleLabel: 'Alumno',
        }}
      >
        <ScreenTemplate title="Encuentra tu centro" hasPlatformHeroBackground>
          <Text>Contenido</Text>
        </ScreenTemplate>
      </CenterIdentityProvider>,
    );

    expect(screen.queryByText('Gimnasio Norte')).not.toBeOnTheScreen();
  });
});
