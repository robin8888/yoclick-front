import { formatStorageSize, formatVideoDuration } from './video-format';

const MEGABYTE = 1_048_576;
const GIGABYTE = 1024 * MEGABYTE;

describe('formatVideoDuration', () => {
  it.each([
    { caseName: 'zero', seconds: 0, expected: '0:00' },
    { caseName: 'less than a minute', seconds: 42, expected: '0:42' },
    { caseName: 'minutes and seconds', seconds: 372, expected: '6:12' },
    { caseName: 'a round minute', seconds: 600, expected: '10:00' },
    { caseName: 'over an hour', seconds: 3930, expected: '1:05:30' },
    { caseName: 'a fraction of a second', seconds: 41.6, expected: '0:42' },
    { caseName: 'a negative value', seconds: -5, expected: '0:00' },
  ])('writes $caseName', ({ seconds, expected }) => {
    expect(formatVideoDuration(seconds)).toBe(expected);
  });
});

describe('formatStorageSize', () => {
  it.each([
    { caseName: 'nothing', bytes: 0, expected: '0 MB' },
    { caseName: 'a few megabytes', bytes: 320 * MEGABYTE, expected: '320 MB' },
    { caseName: 'a decimal of megabyte', bytes: 1.5 * MEGABYTE, expected: '1,5 MB' },
    { caseName: 'just under a gigabyte', bytes: 1023 * MEGABYTE, expected: '1023 MB' },
    { caseName: 'a gigabyte', bytes: GIGABYTE, expected: '1 GB' },
    { caseName: 'gigabytes with a decimal', bytes: 2.5 * GIGABYTE, expected: '2,5 GB' },
    { caseName: 'a big plan', bytes: 200 * GIGABYTE, expected: '200 GB' },
  ])('writes $caseName', ({ bytes, expected }) => {
    expect(formatStorageSize(bytes)).toBe(expected);
  });
});
