import { describeContentMeta } from './content-meta';

type MetaFacts = Parameters<typeof describeContentMeta>[0];

const META_CASES: readonly [string, MetaFacts, string][] = [
  ['a video with its length', video(570), '9:30'],
  ['a video still without length', video(null), ''],
  ['a PDF with its pages', pdf(6, 1000), '6 págs.'],
  ['a PDF with one page', pdf(1, 1000), '1 pág.'],
  ['a PDF whose pages are unknown', pdf(null, 3_145_728), '3 MB'],
];

function video(durationSeconds: number | null): MetaFacts {
  return { kind: 'video', durationSeconds, pageCount: null, sizeBytes: 0 };
}

function pdf(pageCount: number | null, sizeBytes: number): MetaFacts {
  return { kind: 'pdf', durationSeconds: null, pageCount, sizeBytes };
}

describe('describeContentMeta', () => {
  it.each(META_CASES)('describes %s', (_name, content, expected) => {
    expect(describeContentMeta(content)).toBe(expected);
  });
});
