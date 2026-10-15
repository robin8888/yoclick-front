import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { GuardiansSection } from './GuardiansSection';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CHILD_ID = '0198f4a0-0000-7000-8000-000000000041';
const MOTHER_ID = '0198f4a0-0000-7000-8000-000000000042';
const BASE = `/v1/centers/${NORTE_CENTER_ID}`;

describe('GuardiansSection', () => {
  beforeEach(() => {
    act(() => {
      useSessionStore.getState().startSession({ accessToken: 'token', user: null });
      useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
    });
  });

  it('lists the guardians of a person in the file, lets the center remove one and add another', async () => {
    mockApi({
      [`GET ${BASE}/clients/${CHILD_ID}/guardians`]: {
        guardians: [{ membershipId: MOTHER_ID, fullName: 'Rosa Gil', email: 'rosa@test.dev' }],
      },
      [`DELETE ${BASE}/clients/${CHILD_ID}/guardians/${MOTHER_ID}`]: undefined,
    });
    renderScreen(<GuardiansSection membershipId={CHILD_ID} />);

    expect(await screen.findByText('Rosa Gil')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Quitar a Rosa Gil como tutor' }));
    await waitFor(() => {
      expect(
        findApiCall('DELETE', `${BASE}/clients/${CHILD_ID}/guardians/${MOTHER_ID}`),
      ).toBeDefined();
    });

    fireEvent.press(screen.getByRole('button', { name: 'Añadir tutor' }));
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(admin)/guardians/link',
      params: { childMembershipId: CHILD_ID },
    });
  });
});
