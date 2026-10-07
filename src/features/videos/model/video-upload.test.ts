import type { VideoResponseDto } from '@/shared/api/generated/model';

import {
  buildVideoTitle,
  calculateUploadedPercent,
  isVideoTooLarge,
  MAX_VIDEO_POLL_COUNT,
  MAX_VIDEO_SIZE_BYTES,
  VIDEO_POLL_INTERVAL_MS,
  waitUntilVideoIsProcessed,
} from './video-upload';

function buildVideo(status: VideoResponseDto['status']): VideoResponseDto {
  return {
    id: 'video-1',
    title: 'Sentadilla',
    status,
    reviewStatus: 'approved',
    reviewNote: null,
    durationSeconds: null,
    playback: null,
  };
}

describe('isVideoTooLarge', () => {
  it.each([
    { caseName: 'a small video', sizeBytes: 10_000_000, isTooLarge: false },
    { caseName: 'exactly the limit', sizeBytes: MAX_VIDEO_SIZE_BYTES, isTooLarge: false },
    { caseName: 'one byte over', sizeBytes: MAX_VIDEO_SIZE_BYTES + 1, isTooLarge: true },
  ])('says $isTooLarge for $caseName', ({ sizeBytes, isTooLarge }) => {
    expect(isVideoTooLarge(sizeBytes)).toBe(isTooLarge);
  });
});

describe('calculateUploadedPercent', () => {
  it.each([
    { caseName: 'nothing sent', uploaded: 0, total: 1000, expected: 0 },
    { caseName: 'a third', uploaded: 333, total: 1000, expected: 33 },
    { caseName: 'everything', uploaded: 1000, total: 1000, expected: 100 },
    { caseName: 'more than the total', uploaded: 1200, total: 1000, expected: 100 },
    { caseName: 'an empty file', uploaded: 0, total: 0, expected: 0 },
  ])('gives $expected for $caseName', ({ uploaded, total, expected }) => {
    expect(calculateUploadedPercent(uploaded, total)).toBe(expected);
  });
});

describe('buildVideoTitle', () => {
  it.each([
    { caseName: 'a file name', fileName: 'sentadilla goblet.mov', expected: 'sentadilla goblet' },
    { caseName: 'several dots', fileName: 'clase.29.sep.mp4', expected: 'clase.29.sep' },
    { caseName: 'no extension', fileName: 'presentacion', expected: 'presentacion' },
    { caseName: 'a missing name', fileName: null, expected: 'Vídeo' },
    { caseName: 'only an extension', fileName: '.mp4', expected: 'Vídeo' },
  ])('builds the title for $caseName', ({ fileName, expected }) => {
    expect(buildVideoTitle(fileName)).toBe(expected);
  });

  it('cuts a very long name to the limit of the server', () => {
    expect(buildVideoTitle(`${'a'.repeat(300)}.mp4`)).toHaveLength(120);
  });
});

describe('waitUntilVideoIsProcessed', () => {
  it('returns as soon as the video is ready, waiting between questions', async () => {
    const statuses: VideoResponseDto['status'][] = ['uploading', 'processing', 'ready'];
    const fetchVideo = jest.fn(() => Promise.resolve(buildVideo(statuses.shift() ?? 'ready')));
    const wait = jest.fn(() => Promise.resolve());

    const video = await waitUntilVideoIsProcessed({ fetchVideo, wait, isCancelled: () => false });

    expect(video?.status).toBe('ready');
    expect(fetchVideo).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenCalledWith(VIDEO_POLL_INTERVAL_MS);
  });

  it('also returns a failed video, so the screen can say it failed', async () => {
    const video = await waitUntilVideoIsProcessed({
      fetchVideo: () => Promise.resolve(buildVideo('failed')),
      wait: () => Promise.resolve(),
      isCancelled: () => false,
    });

    expect(video?.status).toBe('failed');
  });

  it('stops without asking again once it is cancelled', async () => {
    const fetchVideo = jest.fn(() => Promise.resolve(buildVideo('processing')));
    let isCancelled = false;
    const wait = jest.fn(() => {
      isCancelled = true;
      return Promise.resolve();
    });

    const video = await waitUntilVideoIsProcessed({
      fetchVideo,
      wait,
      isCancelled: () => isCancelled,
    });

    expect(video).toBeNull();
    expect(fetchVideo).toHaveBeenCalledTimes(1);
  });

  it('gives up after the maximum number of questions', async () => {
    const fetchVideo = jest.fn(() => Promise.resolve(buildVideo('processing')));

    const video = await waitUntilVideoIsProcessed({
      fetchVideo,
      wait: () => Promise.resolve(),
      isCancelled: () => false,
    });

    expect(video).toBeNull();
    expect(fetchVideo).toHaveBeenCalledTimes(MAX_VIDEO_POLL_COUNT);
  });
});
