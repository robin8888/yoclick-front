import { buildVideoSource, VIDEO_REQUEST_HEADERS } from './video-playback';

describe('buildVideoSource', () => {
  it('sends the referer the video CDN asks for together with the address', () => {
    expect(buildVideoSource('https://video.example/video-1/playlist.m3u8')).toEqual({
      uri: 'https://video.example/video-1/playlist.m3u8',
      headers: { Referer: 'https://yoclick.app/' },
    });
  });

  it('gives each source its own copy of the headers', () => {
    const source = buildVideoSource('https://video.example/a.m3u8');

    source.headers.Extra = 'x';

    expect(VIDEO_REQUEST_HEADERS).toEqual({ Referer: 'https://yoclick.app/' });
  });
});
