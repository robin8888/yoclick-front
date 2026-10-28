import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { LegalLinks } from './LegalLinks';

function renderLinks(props: Partial<React.ComponentProps<typeof LegalLinks>> = {}): {
  onPrivacyPress: jest.Mock;
  onTermsPress: jest.Mock;
} {
  const onPrivacyPress = jest.fn();
  const onTermsPress = jest.fn();
  renderInTheme(
    <LegalLinks
      links={[
        { label: 'Política de privacidad', onPress: onPrivacyPress },
        {
          label: 'Condiciones del servicio',
          accessibilityLabel: 'Abrir las condiciones del servicio',
          onPress: onTermsPress,
        },
      ]}
      {...props}
    />,
  );
  return { onPrivacyPress, onTermsPress };
}

describe('LegalLinks', () => {
  it('shows each link as an accessible link and runs its own action', () => {
    const { onPrivacyPress, onTermsPress } = renderLinks();

    fireEvent.press(screen.getByRole('link', { name: 'Política de privacidad' }));
    fireEvent.press(screen.getByRole('link', { name: 'Abrir las condiciones del servicio' }));

    expect(onPrivacyPress).toHaveBeenCalledTimes(1);
    expect(onTermsPress).toHaveBeenCalledTimes(1);
  });

  it('shows no alert unless there is an error message', () => {
    renderLinks();

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('announces the error message when a link could not be opened', () => {
    renderLinks({ errorMessage: 'No hemos podido abrir el enlace.' });

    expect(screen.getByRole('alert')).toHaveTextContent('No hemos podido abrir el enlace.');
  });
});
