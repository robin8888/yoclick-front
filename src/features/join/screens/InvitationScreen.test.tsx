import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { usePendingInvitationStore } from '../model/pending-invitation-store';
import { InvitationScreen } from './InvitationScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const CENTER_ID = '0b0cbd0e-7f87-4c43-a5ec-9f5a0b6b5c11';
const INVITATION_PREVIEW = {
  role: 'staff',
  emailHint: 'm***@yopmail.com',
  expiresAt: '2026-10-12T10:00:00.000Z',
  center: { id: CENTER_ID, name: 'Ninja Rojo', sectorId: 'marciales', brandColor: '#C8102E' },
};
const ACCEPTED_INVITATION = {
  membershipId: '5a6f5d0e-2ae6-4c52-8d7a-0f5b3c5b4a22',
  centerId: CENTER_ID,
  role: 'staff',
  status: 'active',
};

describe('InvitationScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    act(() => {
      usePendingInvitationStore.getState().clearInvitation();
    });
  });

  it('asks for the code and shows the center and the role before accepting', async () => {
    mockApi({ 'GET /v1/join/invitations/INV123': INVITATION_PREVIEW });
    renderScreen(<InvitationScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de invitación'), 'INV123');
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Te han invitado a Ninja Rojo')).toBeOnTheScreen();
    expect(screen.getByText('Entrarás como maestro.')).toBeOnTheScreen();
  });

  it('accepts the invitation, makes the center active and goes to the root', async () => {
    mockApi({
      'GET /v1/join/invitations/INV123': INVITATION_PREVIEW,
      'POST /v1/join/invitations/INV123/accept': ACCEPTED_INVITATION,
      'GET /v1/me/memberships': { memberships: [] },
    });
    act(() => {
      usePendingInvitationStore.getState().saveInvitationCode('INV123');
    });
    renderScreen(<InvitationScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Aceptar invitación' }));

    await waitFor(() => {
      expect(getMockRouter().replace).toHaveBeenCalledWith('/');
    });
    expect(findApiCall('POST', '/v1/join/invitations/INV123/accept')).toBeDefined();
    expect(useSessionStore.getState().activeCenterId).toBe(CENTER_ID);
    expect(usePendingInvitationStore.getState().invitationCode).toBeNull();
  });

  it('explains an invalid invitation and keeps the code field', async () => {
    mockApi({
      'GET /v1/join/invitations/MALO': () => {
        throw buildApiError('INVITATION_INVALID', 404);
      },
    });
    renderScreen(<InvitationScreen />);

    fireEvent.changeText(screen.getByLabelText('Código de invitación'), 'MALO');
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
    expect(screen.getByLabelText('Código de invitación')).toBeOnTheScreen();
  });

  it('lets the person skip to the join flow', () => {
    mockApi({});
    renderScreen(<InvitationScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Ahora no' }));

    expect(getMockRouter().replace).toHaveBeenCalledWith('/join');
  });
});
