import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { NORTE_CENTER_ID } from '@/test/factories';
import { buildApiError, findApiCall, getRecordedApiCalls, mockApi } from '@/test/mock-api';
import { getMockRouter, resetMockRouter } from '@/test/mock-router';
import { renderScreen } from '@/test/render-screen';

import { MyPublicProfileScreen } from './MyPublicProfileScreen';
import { TeamMemberProfileScreen } from './TeamMemberProfileScreen';
import { TeamProfilesAdminScreen } from './TeamProfilesAdminScreen';
import { TeamScreen } from './TeamScreen';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

const BASE = `/v1/centers/${NORTE_CENTER_ID}`;
const STAFF_ID = '0198f2a0-7c11-7aaa-8bbb-0123456789ab';
const PLAN_WITH_VIDEO = { isIncluded: true, limitBytes: 5_368_709_120, usedBytes: 0 };
const PLAN_WITHOUT_VIDEO = { isIncluded: false, limitBytes: null, usedBytes: 0 };

const memberships = (role: string) => ({
  memberships: [
    {
      membershipId: 'm1',
      centerId: NORTE_CENTER_ID,
      role,
      center: { sectorId: 'gym', name: 'Studio Norte' },
    },
  ],
});

function buildProfile(overrides: Partial<ProfileResponseDto> = {}): ProfileResponseDto {
  return {
    membershipId: STAFF_ID,
    isMe: true,
    fullName: 'Marta Gil',
    staffTitle: 'Entrenadora',
    headline: 'Entrenadora · 9 años de experiencia',
    bio: 'Ayudo a personas de cualquier nivel a progresar.',
    specialties: ['Fuerza'],
    languages: ['Castellano'],
    status: 'draft',
    reviewNote: null,
    hasPublishConsent: true,
    certifications: [],
    introVideo: null,
    techniqueVideos: [],
    rating: null,
    ...overrides,
  };
}

function signIn(): void {
  act(() => {
    useSessionStore.getState().startSession({ accessToken: 'token', user: null });
    useSessionStore.getState().selectActiveCenter(NORTE_CENTER_ID);
  });
}

describe('MyPublicProfileScreen', () => {
  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  function mockEditorApi(profile: ProfileResponseDto, extra: Record<string, unknown> = {}): void {
    mockApi({
      'GET /v1/me/memberships': memberships('staff'),
      [`GET ${BASE}/team-profiles`]: { members: [profile] },
      [`GET ${BASE}/video-plan`]: PLAN_WITHOUT_VIDEO,
      ...extra,
    });
  }

  it.each([
    {
      caseName: 'a draft',
      profile: buildProfile(),
      text: 'Borrador: tus clientes todavía no lo ven.',
    },
    {
      caseName: 'waiting for the review',
      profile: buildProfile({ status: 'pending' }),
      text: 'Pendiente de revisión: el centro lo verá antes de publicarlo.',
    },
    {
      caseName: 'published',
      profile: buildProfile({ status: 'published' }),
      text: 'Publicado: tus clientes ya lo ven.',
    },
    {
      caseName: 'with changes requested',
      profile: buildProfile({ status: 'changes_requested', reviewNote: 'Cuenta algo más de ti.' }),
      text: 'El centro te pide cambios: Cuenta algo más de ti.',
    },
  ])('says in words that the profile is $caseName', async ({ profile, text }) => {
    mockEditorApi(profile);
    renderScreen(<MyPublicProfileScreen />);

    expect(await screen.findByText(text)).toBeOnTheScreen();
  });

  it('warns that editing a published profile hides it until it is approved again', async () => {
    mockEditorApi(buildProfile({ status: 'published' }));
    renderScreen(<MyPublicProfileScreen />);

    expect(
      await screen.findByText(/deja de verse hasta que el centro lo vuelva a aprobar/),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Guardar y enviar cambios a revisión' }),
    ).toBeOnTheScreen();
  });

  it('explains that the plan has no video, but lets the rest be completed', async () => {
    mockEditorApi(buildProfile());
    renderScreen(<MyPublicProfileScreen />);

    expect(await screen.findByText('Tu plan no incluye vídeo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Titular')).toBeOnTheScreen();
  });

  it('offers the presentation and the technique videos when the plan includes them', async () => {
    mockEditorApi(buildProfile(), { [`GET ${BASE}/video-plan`]: PLAN_WITH_VIDEO });
    renderScreen(<MyPublicProfileScreen />);

    expect(await screen.findByText('Vídeo de presentación')).toBeOnTheScreen();
    expect(screen.getByText('Vídeos de técnica (0 de 3)')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Añadir vídeo' })).toHaveLength(2);
  });

  it('saves what was written, with the chosen specialties and languages', async () => {
    mockEditorApi(buildProfile(), {
      [`PUT ${BASE}/team-profiles/me`]: buildProfile(),
    });
    renderScreen(<MyPublicProfileScreen />);
    const save = await screen.findByRole('button', { name: 'Guardar cambios' });
    expect(save).toBeDisabled();

    fireEvent.changeText(screen.getByLabelText('Titular'), '  Nuevo titular ');
    fireEvent.press(screen.getByRole('checkbox', { name: 'Cardio' }));
    fireEvent.press(screen.getByRole('checkbox', { name: 'Fuerza' }));
    fireEvent.press(screen.getByRole('checkbox', { name: 'Inglés' }));
    fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(findApiCall('PUT', `${BASE}/team-profiles/me`)?.body).toEqual({
        headline: 'Nuevo titular',
        bio: 'Ayudo a personas de cualquier nivel a progresar.',
        specialties: ['Cardio'],
        languages: ['Castellano', 'Inglés'],
        hasPublishConsent: true,
      });
    });
  });

  it('shows the chips with their state in words, not only in color', async () => {
    mockEditorApi(buildProfile());
    renderScreen(<MyPublicProfileScreen />);

    expect(await screen.findByRole('checkbox', { name: 'Fuerza' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Cardio' })).not.toBeChecked();
  });

  it('cannot be sent without the authorization to publish, and says what it is for', async () => {
    mockEditorApi(buildProfile({ hasPublishConsent: false }));
    renderScreen(<MyPublicProfileScreen />);

    expect(await screen.findByRole('button', { name: 'Enviar a revisión' })).toBeDisabled();
    expect(
      screen.getByText(/Autorizo a Studio Norte a publicar mi imagen y mis vídeos/),
    ).toBeOnTheScreen();
  });

  it('saves the pending changes and then sends the profile to review', async () => {
    mockEditorApi(buildProfile(), {
      [`PUT ${BASE}/team-profiles/me`]: buildProfile(),
      [`POST ${BASE}/team-profiles/me/submit`]: buildProfile({ status: 'pending' }),
    });
    renderScreen(<MyPublicProfileScreen />);

    fireEvent.changeText(await screen.findByLabelText('Sobre mí'), 'Una biografía nueva.');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar a revisión' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/team-profiles/me/submit`)).toBeDefined();
    });
    const methods = getRecordedApiCalls()
      .filter(({ path }) => path.includes('/team-profiles/me'))
      .map(({ method }) => method);
    expect(methods).toEqual(['PUT', 'POST']);
  });

  it('sends straight away when there is nothing unsaved', async () => {
    mockEditorApi(buildProfile(), {
      [`POST ${BASE}/team-profiles/me/submit`]: buildProfile({ status: 'pending' }),
    });
    renderScreen(<MyPublicProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Enviar a revisión' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/team-profiles/me/submit`)).toBeDefined();
    });
    expect(findApiCall('PUT', `${BASE}/team-profiles/me`)).toBeUndefined();
  });

  it('says what is missing when the server refuses to send an empty profile', async () => {
    mockEditorApi(buildProfile(), {
      [`POST ${BASE}/team-profiles/me/submit`]: () => {
        throw buildApiError('PROFILE_EMPTY', 409);
      },
    });
    renderScreen(<MyPublicProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Enviar a revisión' }));

    expect(await screen.findByText('Añade algo a tu perfil antes de enviarlo.')).toBeOnTheScreen();
  });

  it('adds and removes certifications, saying whether the center verified them', async () => {
    mockEditorApi(
      buildProfile({
        certifications: [
          {
            id: 'cert-1',
            name: 'Grado en Ciencias del Deporte',
            detail: 'Universidad, 2016',
            isVerified: true,
          },
          { id: 'cert-2', name: 'Primeros auxilios', detail: null, isVerified: false },
        ],
      }),
      {
        [`POST ${BASE}/team-profiles/me/certifications`]: buildProfile(),
        [`DELETE ${BASE}/team-profiles/me/certifications/cert-2`]: null,
      },
    );
    renderScreen(<MyPublicProfileScreen />);

    expect(
      await screen.findByText('Universidad, 2016 · Verificada por el centro'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Pendiente de verificar')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Quitar la titulación Primeros auxilios' }));
    await waitFor(() => {
      expect(findApiCall('DELETE', `${BASE}/team-profiles/me/certifications/cert-2`)).toBeDefined();
    });
    fireEvent.changeText(screen.getByLabelText('Nombre de la titulación'), 'Curso de yoga');
    fireEvent.changeText(screen.getByLabelText('Centro y año (opcional)'), 'Escuela, 2025');
    fireEvent.press(screen.getByRole('button', { name: 'Añadir titulación' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/team-profiles/me/certifications`)?.body).toEqual({
        name: 'Curso de yoga',
        detail: 'Escuela, 2025',
      });
    });
  });

  it('previews the profile as the clients see it and goes back to editing', async () => {
    mockEditorApi(buildProfile({ status: 'published', rating: { average: 4.8, count: 21 } }), {
      [`GET ${BASE}/team-profiles/${STAFF_ID}/reviews`]: { reviews: [] },
    });
    renderScreen(<MyPublicProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Ver como clientes' }));

    expect(screen.getByText('Vista previa: así te ven tus clientes.')).toBeOnTheScreen();
    expect(screen.getByText('★ 4,8 · 21 opiniones')).toBeOnTheScreen();
    expect(await screen.findByText('Todavía no hay opiniones.')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Volver a editar' }));
    expect(screen.getByLabelText('Titular')).toBeOnTheScreen();
  });
});

describe('TeamProfilesAdminScreen', () => {
  const pending = buildProfile({
    status: 'pending',
    isMe: false,
    certifications: [
      { id: 'cert-1', name: 'Grado en Ciencias del Deporte', detail: null, isVerified: false },
    ],
  });

  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  function mockAdminApi(extra: Record<string, unknown> = {}): void {
    mockApi({
      'GET /v1/me/memberships': memberships('owner'),
      [`GET ${BASE}/team-profiles`]: {
        members: [
          pending,
          buildProfile({
            membershipId: 'other',
            fullName: 'Luis Soto',
            status: 'published',
            isMe: false,
          }),
        ],
      },
      [`GET ${BASE}/team-settings`]: { showTeamOnWeb: true, reviewsNeedApproval: true },
      [`GET ${BASE}/staff-reviews/pending`]: { reviews: [] },
      ...extra,
    });
  }

  it('lists who waits for the review and the whole team with their state in words', async () => {
    mockAdminApi();
    renderScreen(<TeamProfilesAdminScreen />);

    expect(await screen.findByRole('button', { name: 'Aprobar y publicar' })).toBeOnTheScreen();
    expect(screen.getByText('Luis Soto')).toBeOnTheScreen();
    expect(screen.getAllByText('Pendiente de revisión').length).toBeGreaterThan(0);
    expect(screen.getByText('Publicado')).toBeOnTheScreen();
  });

  it('says there is nothing to review', async () => {
    mockAdminApi({ [`GET ${BASE}/team-profiles`]: { members: [buildProfile({ isMe: false })] } });
    renderScreen(<TeamProfilesAdminScreen />);

    expect(await screen.findByText(/No hay nada pendiente de revisar/)).toBeOnTheScreen();
  });

  it('approves a profile', async () => {
    mockAdminApi({
      [`POST ${BASE}/team-profiles/${STAFF_ID}/review`]: buildProfile({ status: 'published' }),
    });
    renderScreen(<TeamProfilesAdminScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Aprobar y publicar' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/team-profiles/${STAFF_ID}/review`)?.body).toEqual({
        decision: 'approve',
      });
    });
  });

  it('asks for changes with a note and cannot send it empty', async () => {
    mockAdminApi({ [`POST ${BASE}/team-profiles/${STAFF_ID}/review`]: buildProfile() });
    renderScreen(<TeamProfilesAdminScreen />);
    fireEvent.press(await screen.findByRole('button', { name: 'Pedir cambios' }));

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Qué debe cambiar'), 'Cuenta algo más de ti.');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/team-profiles/${STAFF_ID}/review`)?.body).toEqual({
        decision: 'request_changes',
        note: 'Cuenta algo más de ti.',
      });
    });
  });

  it('verifies a certification', async () => {
    mockAdminApi({
      [`POST ${BASE}/team-profiles/${STAFF_ID}/certifications/cert-1/verify`]: pending,
    });
    renderScreen(<TeamProfilesAdminScreen />);

    fireEvent.press(
      await screen.findByRole('button', {
        name: 'Verificar la titulación Grado en Ciencias del Deporte',
      }),
    );

    await waitFor(() => {
      expect(
        findApiCall('POST', `${BASE}/team-profiles/${STAFF_ID}/certifications/cert-1/verify`),
      ).toBeDefined();
    });
  });

  it('changes the two settings of the team', async () => {
    mockAdminApi({
      [`PUT ${BASE}/team-settings`]: { showTeamOnWeb: false, reviewsNeedApproval: true },
    });
    renderScreen(<TeamProfilesAdminScreen />);

    fireEvent(
      await screen.findByRole('switch', { name: 'Mostrar el equipo en la web de reservas' }),
      'valueChange',
      false,
    );
    await waitFor(() => {
      expect(findApiCall('PUT', `${BASE}/team-settings`)?.body).toEqual({ showTeamOnWeb: false });
    });
    fireEvent(
      screen.getByRole('switch', { name: 'Revisar opiniones antes de publicarlas' }),
      'valueChange',
      false,
    );
    await waitFor(() => {
      expect(
        getRecordedApiCalls().some(
          ({ method, body }) =>
            method === 'PUT' &&
            JSON.stringify(body) === JSON.stringify({ reviewsNeedApproval: false }),
        ),
      ).toBe(true);
    });
  });

  it('publishes or rejects the opinions that wait for the center', async () => {
    mockAdminApi({
      [`GET ${BASE}/staff-reviews/pending`]: {
        reviews: [
          {
            id: 'review-1',
            staffMembershipId: STAFF_ID,
            staffName: 'Marta Gil',
            authorLabel: 'Ana P.',
            rating: 4,
            comment: 'Muy buena clase.',
            status: 'pending',
            createdAt: '2026-10-07T10:00:00.000Z',
          },
        ],
      },
      [`POST ${BASE}/staff-reviews/review-1/moderate`]: {},
    });
    renderScreen(<TeamProfilesAdminScreen />);

    expect(await screen.findByText('Ana P. sobre Marta Gil')).toBeOnTheScreen();
    expect(screen.getByText('Muy buena clase.')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Publicar la opinión de Ana P.' }));

    await waitFor(() => {
      expect(findApiCall('POST', `${BASE}/staff-reviews/review-1/moderate`)?.body).toEqual({
        decision: 'approve',
      });
    });
  });

  it('opens the own profile of the administration', async () => {
    mockAdminApi();
    renderScreen(<TeamProfilesAdminScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Mi perfil profesional' }));

    expect(getMockRouter().push).toHaveBeenCalledWith('/(admin)/public-profile');
  });
});

describe('what the clients see', () => {
  const published = buildProfile({
    status: 'published',
    isMe: false,
    rating: { average: 4.7, count: 3 },
    specialties: ['Fuerza', 'Movilidad'],
    languages: ['Castellano', 'Inglés'],
    certifications: [
      {
        id: 'cert-1',
        name: 'Grado en Ciencias del Deporte',
        detail: 'Universidad, 2016',
        isVerified: true,
      },
    ],
  });

  beforeEach(() => {
    resetMockRouter();
    signIn();
  });

  it('lists the published team and opens a profile', async () => {
    mockApi({
      'GET /v1/me/memberships': memberships('client'),
      [`GET ${BASE}/team-profiles`]: { members: [published] },
    });
    renderScreen(<TeamScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Ver el perfil de Marta Gil' }));

    expect(screen.getByText('★ 4,7 · 3 opiniones')).toBeOnTheScreen();
    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(client)/team/[membershipId]',
      params: { membershipId: STAFF_ID },
    });
  });

  it('explains that there are no profiles yet', async () => {
    mockApi({
      'GET /v1/me/memberships': memberships('client'),
      [`GET ${BASE}/team-profiles`]: { members: [] },
    });
    renderScreen(<TeamScreen />);

    expect(await screen.findByText('Todavía no hay perfiles del equipo')).toBeOnTheScreen();
  });

  function mockProfileApi(extra: Record<string, unknown> = {}): void {
    jest.mocked(useLocalSearchParams).mockReturnValue({ membershipId: STAFF_ID });
    mockApi({
      'GET /v1/me/memberships': memberships('client'),
      [`GET ${BASE}/team-profiles/${STAFF_ID}`]: published,
      [`GET ${BASE}/team-profiles/${STAFF_ID}/reviews`]: {
        reviews: [
          {
            id: 'review-1',
            staffMembershipId: STAFF_ID,
            staffName: 'Marta Gil',
            authorLabel: 'Ana P.',
            rating: 5,
            comment: 'Explica muy bien.',
            status: 'published',
            createdAt: '2026-10-01T10:00:00.000Z',
          },
        ],
      },
      ...extra,
    });
  }

  it('shows the profile with the verified certification and the opinions of real sessions', async () => {
    mockProfileApi();
    renderScreen(<TeamMemberProfileScreen />);

    expect(await screen.findByText('Entrenadora · 9 años de experiencia')).toBeOnTheScreen();
    expect(screen.getByText('Idiomas: Castellano, Inglés')).toBeOnTheScreen();
    expect(screen.getByText('Universidad, 2016 · Verificada por el centro')).toBeOnTheScreen();
    expect(screen.getByText('Titulación verificada por Studio Norte.')).toBeOnTheScreen();
    expect(await screen.findByText('Explica muy bien.')).toBeOnTheScreen();
    expect(screen.getByText('Ana P. · tras una sesión real')).toBeOnTheScreen();
  });

  it('goes to book with that person', async () => {
    mockProfileApi();
    renderScreen(<TeamMemberProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Reservar con Marta' }));

    expect(getMockRouter().push).toHaveBeenCalledWith({
      pathname: '/(client)/(tabs)/book',
      params: { staffMembershipId: STAFF_ID },
    });
  });

  it('sends an opinion and says it will be published once the center reviews it', async () => {
    mockProfileApi({
      [`POST ${BASE}/team-profiles/${STAFF_ID}/reviews`]: {
        id: 'review-2',
        staffMembershipId: STAFF_ID,
        staffName: 'Marta Gil',
        authorLabel: 'Ana P.',
        rating: 4,
        comment: null,
        status: 'pending',
        createdAt: '2026-10-07T10:00:00.000Z',
      },
    });
    renderScreen(<TeamMemberProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Valorar' }));
    fireEvent.press(screen.getByRole('radio', { name: '4 estrellas' }));
    fireEvent.changeText(screen.getByLabelText('¿Qué tal la sesión? (opcional)'), '  ');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar opinión' }));

    expect(
      await screen.findByText('¡Gracias! Tu opinión se publicará cuando el centro la revise.'),
    ).toBeOnTheScreen();
    expect(findApiCall('POST', `${BASE}/team-profiles/${STAFF_ID}/reviews`)?.body).toEqual({
      rating: 4,
      comment: '',
    });
  });

  it('says it was published at once when the center does not review opinions', async () => {
    mockProfileApi({
      [`POST ${BASE}/team-profiles/${STAFF_ID}/reviews`]: {
        id: 'review-2',
        staffMembershipId: STAFF_ID,
        staffName: 'Marta Gil',
        authorLabel: 'Ana P.',
        rating: 5,
        comment: null,
        status: 'published',
        createdAt: '2026-10-07T10:00:00.000Z',
      },
    });
    renderScreen(<TeamMemberProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Valorar' }));
    fireEvent.press(screen.getByRole('button', { name: 'Enviar opinión' }));

    expect(await screen.findByText('¡Gracias! Tu opinión ya está publicada.')).toBeOnTheScreen();
  });

  it('explains that only a real session can be rated', async () => {
    mockProfileApi({
      [`POST ${BASE}/team-profiles/${STAFF_ID}/reviews`]: () => {
        throw buildApiError('REVIEW_NOT_ALLOWED', 409);
      },
    });
    renderScreen(<TeamMemberProfileScreen />);

    fireEvent.press(await screen.findByRole('button', { name: 'Valorar' }));
    fireEvent.press(screen.getByRole('button', { name: 'Enviar opinión' }));

    expect(
      await screen.findByText(/Solo puedes opinar de una sesión que hayas tenido con esta persona/),
    ).toBeOnTheScreen();
  });

  it('goes back to the team when the route is not a valid profile', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ membershipId: 'marta' });
    mockApi({ 'GET /v1/me/memberships': memberships('client') });
    renderScreen(<TeamMemberProfileScreen />);

    expect(screen.getByText('redirect:/(client)/team')).toBeOnTheScreen();
  });
});
