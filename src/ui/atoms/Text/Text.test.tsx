import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ThemeProvider, type ThemeMode, colorTokens } from '@/shared/theme';

import { Text } from './Text';

function renderInTheme(
  element: ReactElement,
  options: { mode?: ThemeMode; brandHexColor?: string } = {},
): void {
  render(
    <ThemeProvider
      initialPreference={options.mode ?? 'light'}
      brandHexColor={options.brandHexColor}
    >
      {element}
    </ThemeProvider>,
  );
}

describe('Text', () => {
  it('renders its content with the body style by default', () => {
    renderInTheme(<Text>Tu instructor ha cambiado la hora de tu cita.</Text>);

    expect(screen.getByText('Tu instructor ha cambiado la hora de tu cita.')).toHaveStyle({
      fontFamily: 'Outfit_400Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colorTokens.light.ink,
    });
  });

  it.each([
    { variant: 'display', fontFamily: 'Outfit_800ExtraBold', fontSize: 36, lineHeight: 38 },
    { variant: 'metric', fontFamily: 'Outfit_800ExtraBold', fontSize: 30, lineHeight: 32 },
    { variant: 'titleLg', fontFamily: 'Outfit_700Bold', fontSize: 26, lineHeight: 30 },
    { variant: 'titleMd', fontFamily: 'Outfit_700Bold', fontSize: 20, lineHeight: 26 },
    { variant: 'bodyStrong', fontFamily: 'Outfit_600SemiBold', fontSize: 17, lineHeight: 24 },
    { variant: 'caption', fontFamily: 'Outfit_500Medium', fontSize: 15, lineHeight: 20 },
    { variant: 'overline', fontFamily: 'Outfit_700Bold', fontSize: 13, lineHeight: 16 },
  ] as const)('applies the $variant type scale entry', ({ variant, ...expectedStyle }) => {
    renderInTheme(<Text variant={variant}>Texto</Text>);

    expect(screen.getByText('Texto')).toHaveStyle(expectedStyle);
  });

  it('respects the system font scale by default', () => {
    renderInTheme(<Text>Reservar cita</Text>);

    const textElement = screen.getByText('Reservar cita');

    expect(textElement.props).toMatchObject({ allowFontScaling: true });
    expect(textElement.props.maxFontSizeMultiplier).toBeUndefined();
  });

  it('lets big metrics cap the font scale', () => {
    renderInTheme(
      <Text variant="metric" maxFontSizeMultiplier={1.5}>
        3 / 4
      </Text>,
    );

    expect(screen.getByText('3 / 4').props).toMatchObject({
      allowFontScaling: true,
      maxFontSizeMultiplier: 1.5,
    });
  });

  it('uses tabular numbers for metrics', () => {
    renderInTheme(<Text variant="metric">12</Text>);

    expect(screen.getByText('12')).toHaveStyle({ fontVariant: ['tabular-nums'] });
  });

  it('shows overline labels in uppercase', () => {
    renderInTheme(<Text variant="overline">esta semana</Text>);

    expect(screen.getByText('esta semana')).toHaveStyle({
      textTransform: 'uppercase',
      letterSpacing: 1.04,
    });
  });

  it.each(['display', 'titleLg', 'titleMd'] as const)(
    'announces the %s variant as a heading',
    (variant) => {
      renderInTheme(<Text variant={variant}>Hola, Marta</Text>);

      expect(screen.getByRole('heading', { name: 'Hola, Marta' })).toBeOnTheScreen();
    },
  );

  it('does not announce body text as a heading', () => {
    renderInTheme(<Text>Hola, Marta</Text>);

    expect(screen.queryByRole('heading')).not.toBeOnTheScreen();
    expect(screen.getByText('Hola, Marta')).toBeOnTheScreen();
  });

  it('lets the caller override the default role', () => {
    renderInTheme(
      <Text variant="titleLg" role="link">
        Agendar cita
      </Text>,
    );

    expect(screen.getByRole('link', { name: 'Agendar cita' })).toBeOnTheScreen();
  });

  it('uses theme colors that change with the mode', () => {
    renderInTheme(<Text color="ink2">Con Lucía Ferrer</Text>, { mode: 'dark' });

    expect(screen.getByText('Con Lucía Ferrer')).toHaveStyle({ color: colorTokens.dark.ink2 });
  });

  it('uses brandInk computed by the brand engine for brand text', () => {
    renderInTheme(<Text color="brandInk">Para Lucas</Text>, { brandHexColor: '#E4572E' });

    expect(screen.getByText('Para Lucas')).toHaveStyle({ color: '#B64625' });
  });

  it('forwards accessibility props and lets screen readers use a custom label', () => {
    renderInTheme(
      <Text accessibilityLabel="Quedan 3 de 4 sesiones" variant="caption">
        3 / 4
      </Text>,
    );

    expect(screen.getByLabelText('Quedan 3 de 4 sesiones')).toBeOnTheScreen();
  });

  it('truncates with an ellipsis when numberOfLines is set', () => {
    renderInTheme(<Text numberOfLines={1}>Entrenamiento personal · 60 min</Text>);

    expect(screen.getByText('Entrenamiento personal · 60 min').props).toMatchObject({
      numberOfLines: 1,
    });
  });

  it('rejects maxFontSizeMultiplier on regular text at compile time', () => {
    renderInTheme(
      // @ts-expect-error solo las métricas grandes (display, metric) pueden limitar el escalado
      <Text variant="body" maxFontSizeMultiplier={1.2}>
        Texto normal
      </Text>,
    );

    expect(screen.getByText('Texto normal')).toBeOnTheScreen();
  });

  it('centers the text when asked to', () => {
    renderInTheme(<Text align="center">Encuentra tu centro</Text>);

    expect(screen.getByText('Encuentra tu centro')).toHaveStyle({ textAlign: 'center' });
  });
});
