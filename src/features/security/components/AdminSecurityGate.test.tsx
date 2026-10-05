import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { buildApiError, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { AdminSecurityGate } from './AdminSecurityGate';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

function renderGate(): void {
  renderScreen(
    <AdminSecurityGate>
      <Text>Zona de administración</Text>
    </AdminSecurityGate>,
  );
}

describe('AdminSecurityGate', () => {
  it('shows the administration area when the second factor is active', async () => {
    mockApi({ 'GET /v1/me/mfa': { isEnabled: true, recoveryCodesRemaining: 10 } });
    renderGate();

    expect(await screen.findByText('Zona de administración')).toBeOnTheScreen();
  });

  it('asks the owner to activate the second factor first when it is not active', async () => {
    mockApi({ 'GET /v1/me/mfa': { isEnabled: false, recoveryCodesRemaining: 0 } });
    renderGate();

    expect(await screen.findByText('Protege tu cuenta')).toBeOnTheScreen();
    expect(screen.queryByText('Zona de administración')).not.toBeOnTheScreen();
  });

  it('offers a retry when the status cannot be checked and never opens the area', async () => {
    mockApi({
      'GET /v1/me/mfa': () => {
        throw buildApiError('INTERNAL_ERROR', 500);
      },
    });
    renderGate();

    expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
    expect(screen.queryByText('Zona de administración')).not.toBeOnTheScreen();
  });
});
