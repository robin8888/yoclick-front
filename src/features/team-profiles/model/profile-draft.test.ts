import type { ProfileResponseDto } from '@/shared/api/generated/model';

import {
  buildSaveRequest,
  createDraftFromProfile,
  hasDraftChanges,
  MAX_CHOSEN_ITEMS,
  toggleChosenItem,
} from './profile-draft';

function buildProfile(overrides: Partial<ProfileResponseDto> = {}): ProfileResponseDto {
  return {
    membershipId: 'staff-1',
    isMe: true,
    fullName: 'Marta Gil',
    staffTitle: null,
    headline: 'Entrenadora',
    bio: 'Hola.',
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

describe('createDraftFromProfile', () => {
  it('turns the missing texts into empty ones for the form', () => {
    const draft = createDraftFromProfile(buildProfile({ headline: null, bio: null }));

    expect(draft).toMatchObject({ headline: '', bio: '', specialties: ['Fuerza'] });
  });
});

describe('toggleChosenItem', () => {
  it.each([
    {
      caseName: 'adds a new one at the end',
      chosen: ['Fuerza'],
      item: 'Cardio',
      expected: ['Fuerza', 'Cardio'],
    },
    {
      caseName: 'removes one already chosen',
      chosen: ['Fuerza', 'Cardio'],
      item: 'Fuerza',
      expected: ['Cardio'],
    },
    { caseName: 'works from nothing', chosen: [], item: 'Fuerza', expected: ['Fuerza'] },
  ])('$caseName', ({ chosen, item, expected }) => {
    expect(toggleChosenItem(chosen, item)).toEqual(expected);
  });

  it('does not grow past the maximum of the server', () => {
    const full = Array.from(
      { length: MAX_CHOSEN_ITEMS },
      (_unused, index) => `Item ${String(index)}`,
    );

    expect(toggleChosenItem(full, 'Otro')).toEqual(full);
  });
});

describe('buildSaveRequest', () => {
  it('trims the texts and turns blanks into nulls', () => {
    const request = buildSaveRequest({
      headline: '  Entrenadora ',
      bio: '   ',
      specialties: ['Fuerza'],
      languages: [],
      hasPublishConsent: true,
    });

    expect(request).toEqual({
      headline: 'Entrenadora',
      bio: null,
      specialties: ['Fuerza'],
      languages: [],
      hasPublishConsent: true,
    });
  });
});

describe('hasDraftChanges', () => {
  const saved = buildProfile();

  it('says there are none right after loading', () => {
    expect(hasDraftChanges(createDraftFromProfile(saved), saved)).toBe(false);
  });

  it.each([
    { caseName: 'the headline', change: { headline: 'Otra cosa' } },
    { caseName: 'the bio', change: { bio: 'Nueva biografía.' } },
    { caseName: 'the specialties', change: { specialties: ['Fuerza', 'Cardio'] } },
    { caseName: 'the languages', change: { languages: ['Inglés'] } },
    { caseName: 'the authorization', change: { hasPublishConsent: false } },
  ])('notices a change in $caseName', ({ change }) => {
    expect(hasDraftChanges({ ...createDraftFromProfile(saved), ...change }, saved)).toBe(true);
  });

  it('ignores spaces around the texts', () => {
    const draft = { ...createDraftFromProfile(saved), headline: '  Entrenadora  ' };

    expect(hasDraftChanges(draft, saved)).toBe(false);
  });
});
