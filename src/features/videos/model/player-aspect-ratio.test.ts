import { DEFAULT_PLAYER_ASPECT_RATIO, resolvePlayerAspectRatio } from './player-aspect-ratio';

describe('resolvePlayerAspectRatio', () => {
  it.each([
    { caseName: 'unknown size', size: null, expected: DEFAULT_PLAYER_ASPECT_RATIO },
    {
      caseName: 'an empty size',
      size: { width: 0, height: 0 },
      expected: DEFAULT_PLAYER_ASPECT_RATIO,
    },
    { caseName: 'a 16:9 video', size: { width: 1920, height: 1080 }, expected: 16 / 9 },
    {
      caseName: 'a wider video, capped at 16:9',
      size: { width: 2000, height: 800 },
      expected: 16 / 9,
    },
    { caseName: 'a square video', size: { width: 1000, height: 1000 }, expected: 1 },
    {
      caseName: 'a 9:16 phone video, capped at 3:4',
      size: { width: 720, height: 1280 },
      expected: 0.75,
    },
  ])('gives the frame of $caseName', ({ size, expected }) => {
    expect(resolvePlayerAspectRatio(size)).toBeCloseTo(expected);
  });
});
