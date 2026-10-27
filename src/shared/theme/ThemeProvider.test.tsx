import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, useColorScheme } from 'react-native';

import { useCenterAppearance } from './center-appearance-context';
import { ThemeProvider, useTheme, useThemePreference } from './ThemeProvider';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(),
  __esModule: true,
}));

const mockedUseColorScheme = jest.mocked(useColorScheme);

function ThemeProbe(): React.JSX.Element {
  const { mode, colors } = useTheme();
  const { themePreference, setThemePreference } = useThemePreference();
  return (
    <>
      <Text>{`mode:${mode}`}</Text>
      <Text>{`brand:${colors.brand}`}</Text>
      <Text>{`brandInk:${colors.brandInk}`}</Text>
      <Text>{`preference:${themePreference}`}</Text>
      <Text
        onPress={() => {
          setThemePreference('dark');
        }}
      >
        Usar oscuro
      </Text>
    </>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockedUseColorScheme.mockReturnValue('light');
  });

  it('follows the system color scheme by default', () => {
    mockedUseColorScheme.mockReturnValue('dark');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText('mode:dark')).toBeOnTheScreen();
    expect(screen.getByText('preference:system')).toBeOnTheScreen();
  });

  it('falls back to light when the system has no preference', () => {
    mockedUseColorScheme.mockReturnValue('unspecified');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText('mode:light')).toBeOnTheScreen();
  });

  it('lets an explicit preference override the system scheme', () => {
    render(
      <ThemeProvider initialPreference="dark">
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText('mode:dark')).toBeOnTheScreen();
  });

  it('switches mode when the preference changes', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByText('Usar oscuro'));

    expect(screen.getByText('mode:dark')).toBeOnTheScreen();
    expect(screen.getByText('preference:dark')).toBeOnTheScreen();
  });

  it('injects the center brand colors computed by the brand engine', () => {
    render(
      <ThemeProvider brandHexColor="#E4572E">
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText('brand:#E4572E')).toBeOnTheScreen();
    expect(screen.getByText('brandInk:#B64625')).toBeOnTheScreen();
  });

  describe('with a dark background of the center', () => {
    const DARK_BACKGROUND = {
      backgroundColor: '#0E0E0E',
      backgroundColorEnd: null,
      hiveColor: null,
    };

    function AppearanceProbe(): React.JSX.Element {
      const { backgroundColor } = useCenterAppearance();
      const { setThemePreference } = useThemePreference();
      return (
        <>
          <ThemeProbe />
          <Text>{`background:${backgroundColor ?? 'none'}`}</Text>
          <Text
            onPress={() => {
              setThemePreference('light');
            }}
          >
            Usar claro
          </Text>
        </>
      );
    }

    function renderCenter(): void {
      render(
        <ThemeProvider centerAppearance={DARK_BACKGROUND}>
          <AppearanceProbe />
        </ThemeProvider>,
      );
    }

    it('adjusts the mode on its own while the preference is the system one', () => {
      mockedUseColorScheme.mockReturnValue('light');
      renderCenter();

      expect(screen.getByText('mode:dark')).toBeOnTheScreen();
      expect(screen.getByText('background:#0E0E0E')).toBeOnTheScreen();
    });

    it('respects the light mode the person chooses and drops the background that would not read', () => {
      mockedUseColorScheme.mockReturnValue('light');
      renderCenter();

      fireEvent.press(screen.getByText('Usar claro'));

      expect(screen.getByText('mode:light')).toBeOnTheScreen();
      expect(screen.getByText('background:none')).toBeOnTheScreen();
    });

    it('keeps the background when the chosen mode reads on it', () => {
      mockedUseColorScheme.mockReturnValue('light');
      renderCenter();

      fireEvent.press(screen.getByText('Usar oscuro'));

      expect(screen.getByText('mode:dark')).toBeOnTheScreen();
      expect(screen.getByText('background:#0E0E0E')).toBeOnTheScreen();
    });
  });

  it('throws a clear error when useTheme is used outside the provider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<ThemeProbe />)).toThrow('useTheme must be used inside <ThemeProvider>.');

    consoleErrorSpy.mockRestore();
  });
});
