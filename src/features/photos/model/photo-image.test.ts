import { AVATAR_EDGE_PIXELS, GALLERY_MAX_EDGE_PIXELS, resolveTargetSize } from './photo-image';

describe('resolveTargetSize', () => {
  it.each([
    {
      caseName: 'a profile photo, always square',
      shape: 'square' as const,
      source: { width: 3000, height: 3000 },
      expected: { width: AVATAR_EDGE_PIXELS, height: AVATAR_EDGE_PIXELS },
    },
    {
      caseName: 'a small gallery photo, kept as it is',
      shape: 'free' as const,
      source: { width: 800, height: 600 },
      expected: { width: 800, height: 600 },
    },
    {
      caseName: 'a wide gallery photo, shrunk by its long edge',
      shape: 'free' as const,
      source: { width: 4000, height: 3000 },
      expected: { width: GALLERY_MAX_EDGE_PIXELS, height: 960 },
    },
    {
      caseName: 'a tall gallery photo, shrunk by its long edge',
      shape: 'free' as const,
      source: { width: 3000, height: 4000 },
      expected: { width: 960, height: GALLERY_MAX_EDGE_PIXELS },
    },
  ])('gives the size of $caseName', ({ shape, source, expected }) => {
    expect(resolveTargetSize(shape, source)).toEqual(expected);
  });
});
