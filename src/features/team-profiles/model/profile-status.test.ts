import { canSubmitProfile } from './profile-status';

const READY = {
  headline: 'Entrenadora',
  bio: null,
  introVideo: null,
  hasPublishConsent: true,
  status: 'draft',
} as const;

describe('canSubmitProfile', () => {
  it.each([
    { caseName: 'a draft with a headline and the authorization', profile: READY, canSubmit: true },
    {
      caseName: 'a profile with changes requested',
      profile: { ...READY, status: 'changes_requested' },
      canSubmit: true,
    },
    {
      caseName: 'a profile already waiting for the review',
      profile: { ...READY, status: 'pending' },
      canSubmit: false,
    },
    {
      caseName: 'no authorization to publish',
      profile: { ...READY, hasPublishConsent: false },
      canSubmit: false,
    },
    { caseName: 'nothing to show', profile: { ...READY, headline: null }, canSubmit: false },
    {
      caseName: 'only a bio',
      profile: { ...READY, headline: null, bio: 'Hola.' },
      canSubmit: true,
    },
  ] as const)('says $canSubmit for $caseName', ({ profile, canSubmit }) => {
    expect(canSubmitProfile(profile)).toBe(canSubmit);
  });
});
