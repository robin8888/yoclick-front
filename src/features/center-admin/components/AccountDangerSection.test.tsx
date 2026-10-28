import { fireEvent, screen } from '@testing-library/react-native';

import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { AccountDangerSection } from './AccountDangerSection';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

describe('AccountDangerSection', () => {
  beforeEach(() => {
    resetMockRouter();
  });

  it('lets the owner reach the privacy policy and the terms (Apple 5.1.1(i))', () => {
    renderScreen(<AccountDangerSection />);

    expect(screen.getByRole('link', { name: 'Política de privacidad' })).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: 'Condiciones del servicio' })).toBeOnTheScreen();
  });

  it('lets the owner reach the account deletion from inside the app (Apple 5.1.1(v))', () => {
    renderScreen(<AccountDangerSection />);

    fireEvent.press(screen.getByRole('button', { name: 'Eliminar mi cuenta' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/delete-account');
  });
});
